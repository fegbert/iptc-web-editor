import type { FileWithHandle } from 'browser-fs-access'
import type { FileWithMetadata } from '~/shared/types'
import { parseMetadata, writeMetadata } from 'iptc-parser'

const loadedFiles = ref<FileWithMetadata[]>([])
const isLoading = ref(true)
const fileAmount = ref(0)

const IDB_KEY_FILES = 'uploaded-images'
const COOKIE_KEY_FILE_AMOUNT = 'file-amount'

async function loadFilesFromIndexedDB() {
  const files = await loadFromIdb<FileWithMetadata[]>(IDB_KEY_FILES, [])
  loadedFiles.value = files ?? []
  isLoading.value = false

  const amountCookie = useCookie(COOKIE_KEY_FILE_AMOUNT)
  amountCookie.value = String(loadedFiles.value.length)
}

function loadAmountFromCookies() {
  const amountCookie = useCookie(COOKIE_KEY_FILE_AMOUNT)
  fileAmount.value = Number.parseInt(amountCookie.value ?? '0')
}

function deduplicateFiles(files: FileWithMetadata[]) {
  const dedupedIds = new Set()

  return files.filter((file) => {
    if (dedupedIds.has(file.id)) {
      return false
    }
    dedupedIds.add(file.id)
    return true
  })
}

async function update(updatedFiles: FileWithMetadata[]) {
  await updateIdb<FileWithMetadata[]>(IDB_KEY_FILES, updatedFiles)

  await loadFilesFromIndexedDB()
}

async function addFiles(files: FileWithHandle[]) {
  const metadataMapping: FileWithMetadata[] = await Promise.all(files.map(async (file) => {
    const buffer = await file.arrayBuffer()
    const fileId = getFileId(file)

    try {
      const metadata = parseMetadata(new Uint8Array(buffer))

      return {
        id: fileId,
        file,
        handle: file.handle,
        metadata,
      }
    }
    catch {
      return {
        id: fileId,
        file,
        handle: file.handle,
        metadata: {},
      }
    }
  }))

  const dedupedUpdatedFiles = deduplicateFiles([...loadedFiles.value, ...metadataMapping])
  update(dedupedUpdatedFiles)
}

function markAsDownloaded(fileIds: string[]) {
  loadedFiles.value = loadedFiles.value.map((file) => {
    if (fileIds.includes(file.id)) {
      return {
        ...file,
        isDownloaded: true,
      }
    }
    return file
  })
}

async function removeFile(fileToRemove: FileWithMetadata) {
  const { selectedIndexes, update: updateIndexes } = useFileSelection()

  if (fileToRemove.isSelected) {
    const indexToRemove = loadedFiles.value.findIndex(file => file.file === fileToRemove.file)
    if (indexToRemove === -1) {
      return
    }
    selectedIndexes.value = selectedIndexes.value.filter(index => index !== indexToRemove)
  }

  const updatedFiles = loadedFiles.value.filter(file => file.file !== fileToRemove.file)

  await update(updatedFiles)
  await updateIndexes(selectedIndexes.value)
}

async function updateMetadata(file: FileWithMetadata, metadata: Array<{ key: string, value?: string }>) {
  const mappedMetadata = metadata.reduce<Record<string, string | undefined>>((acc, { key, value }) => {
    acc[key] = value
    return acc
  }, {})

  const originatingProgram: string | undefined = import.meta.env.VITE_APP_NAME
  const programVersion: string | undefined = import.meta.env.VITE_APP_VERSION

  if (!originatingProgram || !programVersion) {
    console.warn('Could not set originating program and version in metadata update')
  }

  const updatedMetadata = {
    ...file.metadata,
    ...mappedMetadata,
    // Automatically set originating program and version using values from env file if defined
    ...(originatingProgram ? { '2:65': originatingProgram } : {}),
    ...(programVersion ? { '2:70': programVersion } : {}),
  }

  try {
    await writeMetadata(file.file, updatedMetadata, undefined, file.handle)
  }
  catch (e) {
    console.warn('Failed to save metadata for file: ', file.file.name, ' - ', e)
  }

  const updatedFiles = loadedFiles.value.map((loadedFile) => {
    if (loadedFile.id === file.id) {
      return {
        ...toRaw(loadedFile),
        metadata: updatedMetadata,
      }
    }

    return toRaw(loadedFile)
  })

  // Update file state after metadata change
  const { reloadStates } = useFileState()
  reloadStates(updatedFiles)

  await update(updatedFiles)
}

function fileById(fileId: string) {
  return loadedFiles.value.find(file => file.id === fileId)
}

const selectedFiles = computed(() => {
  const { isSelected } = useFileSelection()
  return loadedFiles.value.filter((_, index) => isSelected(index))
})

export default function () {
  if (!import.meta.env.SSR) {
    loadFilesFromIndexedDB()
  }

  loadAmountFromCookies()

  return {
    loadedFiles,
    selectedFiles,
    isLoading,
    loadFilesFromIndexedDB,
    addFiles,
    removeFile,
    fileAmount,
    updateMetadata,
    fileById,
    markAsDownloaded,
    update,
  }
}
