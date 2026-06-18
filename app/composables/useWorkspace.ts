import { parseMetadata, writeMetadata } from 'iptc-parser'

const isUploading = ref(false)
const isSaving = ref(false)
const isDownloading = ref(false)

export default function useWorkspace() {
  const { queryClient, $trpc } = useMutationHelpers()
  const { fileStates, filesChanged, fileChanges, getFileState } = useFileState()
  const { selections, selectedIds } = useFileSelection()
  const { loadedFiles } = useFiles()
  const toast = useToast()

  function clearStorage() {
    loadedFiles.value = {}
    fileStates.value = {}
    selections.value = {}
  }

  async function saveAll() {
    if (!filesChanged.value) {
      return
    }

    isSaving.value = true

    const toSave = Object.keys(fileStates.value).filter(fileId => fileChanges(fileId) > 0)

    const saveResults = await Promise.allSettled(toSave.map(async (fileId) => {
      const metadata = Object.fromEntries(
        getFileState(fileId).filter(state => state.value).map(state => [state.key, state.value]),
      )

      await $trpc.file.updateMetadata.mutate({ fileId, metadata })
    }))

    isSaving.value = false

    const successfullySaved = saveResults.filter(result => result.status === 'fulfilled').length
    const hasSavedAll = successfullySaved === toSave.length

    toast.add({
      title: hasSavedAll ? `${successfullySaved} files saved.` : `${successfullySaved} of ${toSave.length} files saved.`,
      description: hasSavedAll ? '' : 'Some files could not be saved. Please try again.',
      color: hasSavedAll ? 'success' : 'warning',
      duration: 3000,
    })
  }

  async function download() {
    if (!selectedIds.value.length) {
      return
    }

    isDownloading.value = true

    await Promise.allSettled(selectedIds.value.map(async (fileId) => {
      const file = loadedFiles.value[fileId]
      if (!file?.previewUrl) {
        return
      }

      const buffer = await fetch(file.previewUrl).then(file => file.arrayBuffer())
      await writeMetadata(new Uint8Array(buffer), file.metadata, undefined, undefined, file.data.name)
    }))

    isDownloading.value = false
  }

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
    clearStorage,
    saveAll,
    isSaving,
    download,
    isDownloading,
  }
}
