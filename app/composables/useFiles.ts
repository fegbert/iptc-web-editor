import type { FileWithHandle } from 'browser-fs-access'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'

const loadedFiles = ref<FileWithHandle[]>([])
const isLoading = ref(true)

// setup loaded files
function loadFilesFromIndexedDB() {
  const { data: files, isFinished } = useIDBKeyval<FileWithHandle[]>('uploaded-images', [])

  watch(() => isFinished.value, (newVal) => {
    if (newVal) {
      loadedFiles.value = files.value || []
      isLoading.value = false
    }
  })
}

function deduplicateFiles(files: FileWithHandle[]) {
  const dedupedIds = new Set()

  return files.filter((file) => {
    const id = file.name + file.lastModified + file.size
    if (dedupedIds.has(id)) {
      return false
    }
    dedupedIds.add(id)
    return true
  })
}

async function addFiles(files: FileWithHandle[]) {
  const dedupedUpdatedFiles = deduplicateFiles([...loadedFiles.value, ...files])

  const { set } = useIDBKeyval<FileWithHandle[]>('uploaded-images', loadedFiles.value)
  await set(dedupedUpdatedFiles)

  loadFilesFromIndexedDB()
}

async function removeFile(fileToRemove: FileWithHandle) {
  const updatedFiles = loadedFiles.value.filter(file => file !== fileToRemove)

  const { set } = useIDBKeyval<FileWithHandle[]>('uploaded-images', loadedFiles.value)
  await set(updatedFiles)

  loadFilesFromIndexedDB()
}

export default function () {
  if (!import.meta.env.SSR) {
    loadFilesFromIndexedDB()
  }

  return { loadedFiles, isLoading, loadFilesFromIndexedDB, addFiles, removeFile }
}
