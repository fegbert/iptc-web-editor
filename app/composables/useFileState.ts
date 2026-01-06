import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'
import { supported } from 'browser-fs-access'
import { iptcIimFields } from '~/utils/iptc-iim/mapping'

type FileState = Record<string, IPTCFieldWithValue[]>

const fileStates = ref<FileState>({})
const isLoading = ref(true)

export default function useFileState() {
  const { loadedFiles, updateMetadata, markAsDownloaded } = useFiles()

  async function loadFileStatesFromIndexedDB() {
    if (import.meta.env.SSR) {
      return
    }

    const states = await loadFromIdb<FileState>('file-states', {})
    fileStates.value = states ?? {}
    isLoading.value = false
  }

  function setupFileState(fileId: string) {
    const file = loadedFiles.value[fileId]

    if (!file) {
      throw new Error('File not found for setting up state')
    }

    fileStates.value[fileId] = iptcIimFields.map(field => ({
      ...field,
      value: file.metadata[field.key] || '',
    }))
  }

  function removeFileState(fileId: string) {
    delete fileStates.value[fileId]
  }

  function getFileState(fileId: string) {
    return fileStates.value[fileId] || []
  }

  function updateFileData(fileId: string, key: string, newValue?: string) {
    if (!fileStates.value[fileId]) {
      setupFileState(fileId)
    }

    fileStates.value[fileId]!.map((field) => {
      if (field.key === key) {
        field.value = newValue ?? ''
      }
      return field
    })
  }

  function fileChanges(fileId: string) {
    const file = loadedFiles.value[fileId]
    if (!file) {
      return 0
    }

    const state = getFileState(fileId)
    let changes = 0

    state.forEach((field) => {
      const originalValue = file.metadata[field.key] ?? ''
      if (originalValue !== field.value) {
        changes++
      }
    })

    return changes
  }

  const filesChanged = computed(() => Object.keys(fileStates.value).filter(fileId => fileChanges(fileId) > 0).length)

  async function saveAll() {
    if (!filesChanged.value) {
      return
    }

    const statesToSave = Object.entries(fileStates.value).filter(([fileId, _]) => fileChanges(fileId) > 0).map(([fileId, state]) => ({
      fileId,
      state,
    }))

    statesToSave.forEach(async ({ fileId, state }) => {
      const file = loadedFiles.value[fileId]
      if (!file) {
        throw new Error('File not found for saving metadata')
      }

      await updateMetadata(file, state)
    })

    const toast = useToast()

    const toastTitle = supported ? `${statesToSave.length} file${statesToSave.length === 1 ? '' : 's'} saved successfully.` : ` ${statesToSave.length} file${statesToSave.length === 1 ? ' has' : 's have'} been downloaded with updated metadata.`

    toast.add({
      title: toastTitle,
      duration: 3000,
      color: 'success',
    })

    if (!supported) {
      markAsDownloaded(statesToSave.map(s => s.fileId))
    }
  }

  return {
    fileStates,
    setupFileState,
    removeFileState,
    getFileState,
    updateFileData,
    fileChanges,
    filesChanged,
    saveAll,
    isLoading,
    loadFileStatesFromIndexedDB,
  }
}
