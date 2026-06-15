import { parseMetadata } from 'iptc-parser'

const isUploading = ref(false)

export default function useWorkspace() {
  const { queryClient, $trpc } = useMutationHelpers()

  async function uploadFiles(files: File[]) {
    isUploading.value = true
    const uploaded = await Promise.allSettled(files.map(async (file) => {
      if (file.type !== 'image/jpeg') {
        throw new Error('Only JPEG files can be uploaded at the moment')
      }
      // 1. Fetch upload URL and generated r2 key from server
      const { uploadUrl, r2Key } = await $trpc.file.getUploadUrl.query({
        contentType: file.type,
        filename: file.name,
        size: file.size,
      })

      const fileBuffer = await file.arrayBuffer()

      // 2. Upload the file directly to R2 using the fetched upload URL
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileBuffer,
        headers: {
          'Content-Type': file.type,
          'Content-Length': file.size.toString(),
        },
      })

      if (!response.ok) {
        throw new Error (`Failed to upload image to the storage server: ${response.status} - ${response.statusText}`)
      }

      // 3. Parse metadata from the file buffer
      let metadata: Record<string, any> = {}
      try {
        metadata = parseMetadata(new Uint8Array(fileBuffer))
      }
      catch (error) {
        console.error('Error parsing metadata, proceeding without it', error)
      }

      // 4. Create a database record for the uploaded file, associating it with the user's organization
      await $trpc.file.create.mutate({
        contentType: file.type,
        name: file.name,
        r2Key,
        lastModified: file.lastModified.toString(),
        size: file.size,
        metadata,
        path: file.webkitRelativePath ?? undefined,
      })
    }))

    isUploading.value = false

    const successfullUploads = uploaded.filter(result => result.status === 'fulfilled').length
    const notificationDescription = successfullUploads === files.length
      ? `All ${successfullUploads} files were uploaded successfully.`
      : `${successfullUploads} out of ${files.length} files were uploaded successfully.`

    const notification = useToast()
    notification.add({
      title: `Upload completed`,
      description: notificationDescription,
      color: successfullUploads === files.length ? 'success' : 'warning',
      duration: 5000,
      icon: successfullUploads === files.length ? 'check' : 'alert-circle',
    })

    await queryClient.invalidateQueries({ queryKey: ['file'] })
  }

  return {
    uploadFiles,
    isUploading,
  }
}
