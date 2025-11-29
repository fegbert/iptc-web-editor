import type { FileWithHandle } from 'browser-fs-access'
import type { FileWithMetadata } from '~/shared/types'
import { parseMetadata, writeMetadata } from 'iptc-parser'

export type FilesIdb = Record<string, FileWithMetadata>

const loadedFiles = ref<FilesIdb>({})
const isLoading = ref(true)
const fileAmount = ref(0)

const IDB_KEY_FILES = 'uploaded-images'
const COOKIE_KEY_FILE_AMOUNT = 'file-amount'

export default function useFiles() {
  async function loadFilesFromIndexedDB() {
    if (import.meta.env.SSR) {
      return
    }

    const files = await loadFromIdb<FilesIdb>(IDB_KEY_FILES, {})
    loadedFiles.value = files ?? {}
    isLoading.value = false
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
          metadata: {
            '2:00': '\u0000\u0004',
          },
        }
      }
    }))

    const dedupedUpdatedFiles = deduplicateFiles([...Object.values(loadedFiles.value), ...metadataMapping])

    const { setupFileState } = useFileState()

    dedupedUpdatedFiles.forEach((file) => {
      loadedFiles.value[file.id] = file
      setupFileState(file.id)
    })

    fileAmount.value = Object.keys(loadedFiles.value).length

    const amountCookie = useCookie(COOKIE_KEY_FILE_AMOUNT)
    amountCookie.value = String(fileAmount.value)
  }

  function markAsDownloaded(fileIds: string[]) {
    fileIds.forEach((fileId) => {
      if (!loadedFiles.value[fileId]) {
        return
      }

      loadedFiles.value[fileId] = {
        ...loadedFiles.value[fileId],
        isDownloaded: true,
      }
    })
  }

  function removeFile(fileToRemoveId: string) {
    const { selections } = useFileSelection()

    delete selections.value[fileToRemoveId]
    delete loadedFiles.value[fileToRemoveId]
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

    loadedFiles.value[file.id] = {
      ...file,
      metadata: updatedMetadata,
    }
  }

  function getOriginal(fileId: string, key: string): string | undefined {
    const file = loadedFiles.value[fileId]
    if (!file) {
      return undefined
    }

    return file.metadata[key]
  }

  return {
    loadedFiles,
    isLoading,
    loadFilesFromIndexedDB,
    loadAmountFromCookies,
    addFiles,
    removeFile,
    fileAmount,
    updateMetadata,
    markAsDownloaded,
    getOriginal,
  }
}
