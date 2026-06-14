import type { FileWithMetadata } from '~/shared/types'

export default function useWorkspace() {
  const { queryClient, $trpc } = useMutationHelpers()

  async function uploadFiles(files: FileWithMetadata[]) {
    const uploaded = await Promise.allSettled(files.map(async (file) => {
      if (file.data.type !== 'image/jpeg') {
        throw new Error('Only JPEG files can be uploaded at the moment')
      }
      // 1. Fetch upload URL and generated r2 key from server
      const { uploadUrl, r2Key } = await $trpc.file.getUploadUrl.query({
        contentType: file.data.type,
        filename: file.data.name,
        size: file.data.size,
      })

      // 2. Upload the file directly to R2 using the fetched upload URL
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file.buffer,
        headers: {
          'Content-Type': file.data.type,
          'Content-Length': file.data.size.toString(),
        },
      })

      if (!response.ok) {
        throw new Error (`Failed to upload image to the storage server: ${response.status} - ${response.statusText}`)
      }

      // 3. Create a database record for the uploaded file, associating it with the user's organization
      await $trpc.file.create.mutate({
        contentType: file.data.type,
        name: file.data.name,
        r2Key,
        size: file.data.size,
        metadata: file.metadata,
        path: file.data.path,
      })
    }))

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
  }
}
