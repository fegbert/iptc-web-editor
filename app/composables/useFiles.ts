import type { FileWithHandle } from 'browser-fs-access'
import type { FileWithMetadata } from '~/shared/types'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'
import { parseMetadata } from 'iptc-parser'

const loadedFiles = ref<FileWithMetadata[]>([])
const isLoading = ref(true)
const fileAmount = ref(0)

function loadFilesFromIndexedDB() {
  const { data: files, isFinished } = useIDBKeyval<FileWithMetadata[]>('uploaded-images', [])

  watch(() => isFinished.value, (newVal) => {
    if (newVal) {
      loadedFiles.value = files.value || []
      isLoading.value = false

      const amountCookie = useCookie('file-amount')
      amountCookie.value = String(loadedFiles.value.length)
    }
  })
}

function loadAmountFromCookies() {
  const amountCookie = useCookie('file-amount')
  fileAmount.value = Number.parseInt(amountCookie.value ?? '0')
}

function deduplicateFiles(files: FileWithMetadata[]) {
  const dedupedIds = new Set()

  return files.filter((file) => {
    const id = file.file.name + file.file.lastModified + file.file.size
    if (dedupedIds.has(id)) {
      return false
    }
    dedupedIds.add(id)
    return true
  })
}

async function addFiles(files: FileWithHandle[]) {
  // load metadata for new files
  const metadataMapping: FileWithMetadata[] = await Promise.all(files.map(async (file) => {
    const buffer = await file.arrayBuffer()

    try {
      const metadata = parseMetadata(new Uint8Array(buffer))
      return {
        file,
        metadata,
      }
    }
    catch (e) {
      console.warn('Failed to find metadata for file: ', file.name, ' - ', e)
      return {
        file,
        metadata: {},
      }
    }
  }))

  const rawLoadedFiles = toRaw(loadedFiles.value)
  const dedupedUpdatedFiles = deduplicateFiles([...rawLoadedFiles, ...metadataMapping])

  const { set } = useIDBKeyval<FileWithMetadata[]>('uploaded-images', loadedFiles.value)
  await set(dedupedUpdatedFiles)

  loadFilesFromIndexedDB()
}

async function removeFile(fileToRemove: FileWithHandle) {
  const updatedFiles = loadedFiles.value.filter(file => file.file !== fileToRemove).map(file => toRaw(file))

  const { set } = useIDBKeyval<FileWithMetadata[]>('uploaded-images', loadedFiles.value)
  await set(updatedFiles)

  loadFilesFromIndexedDB()
}

export default function () {
  if (!import.meta.env.SSR) {
    loadFilesFromIndexedDB()
  }

  loadAmountFromCookies()

  return { loadedFiles, isLoading, loadFilesFromIndexedDB, addFiles, removeFile, fileAmount }
}
