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

  function updateFileAmountCookie() {
    fileAmount.value = Object.keys(loadedFiles.value).length
    const amountCookie = useCookie(COOKIE_KEY_FILE_AMOUNT)
    amountCookie.value = String(fileAmount.value)
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

      const fileData = {
        name: file.name,
        type: file.type,
        lastModified: file.lastModified,
        size: file.size,
      }

      try {
        const metadata = parseMetadata(new Uint8Array(buffer))

        return {
          id: fileId,
          buffer,
          data: fileData,
          handle: file.handle,
          metadata,
        }
      }
      catch {
        return {
          id: fileId,
          buffer,
          data: fileData,
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

    updateFileAmountCookie()
  }

  function markAsDownloaded(fileIds: string[]) {
    fileIds.forEach((fileId) => {
      if (!loadedFiles.value[fileId]) {
        return
      }
      loadedFiles.value[fileId].isDownloaded = true
    })
  }

  function removeFile(fileToRemoveId: string) {
    const { selections } = useFileSelection()

    delete selections.value[fileToRemoveId]
    delete loadedFiles.value[fileToRemoveId]

    updateFileAmountCookie()
  }

  async function updateMetadata(file: FileWithMetadata, metadata: Array<{ key: string, value?: string }>) {
    const mappedMetadata = metadata.reduce<Record<string, string | undefined>>((acc, { key, value }) => {
      acc[key] = value
      return acc
    }, {})

    const config = useRuntimeConfig()

    const originatingProgram = config.public.appName as string | undefined
    const programVersion = config.public.appVersion as string | undefined

    if (!originatingProgram || !programVersion) {
      console.warn('Could not set originating program and version in metadata update')
    }

    // Strip out empty keys and values
    const strippedMappedMetadata = Object.entries(mappedMetadata).reduce<Record<string, string>>((acc, [key, value]) => {
      if (key && value) {
        acc[key] = value
      }
      return acc
    }, {})

    const updatedMetadata = {
      ...file.metadata,
      ...strippedMappedMetadata,
      // Automatically set originating program and version using values from package.json
      ...(originatingProgram ? { '2:65': originatingProgram } : {}),
      ...(programVersion ? { '2:70': programVersion } : {}),
    }

    try {
      await writeMetadata(new Uint8Array(file.buffer), updatedMetadata, undefined, file.handle, file.data.name)
    }
    catch (e) {
      console.warn('Failed to save metadata for file: ', file.data.name, ' - ', e)
    }

    loadedFiles.value[file.id]!.metadata = updatedMetadata
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
