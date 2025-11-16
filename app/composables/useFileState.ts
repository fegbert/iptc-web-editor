import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval.mjs'
import { supported } from 'browser-fs-access'
import { iptcIimFields } from '~/utils/iptc-iim/mapping'

type FileState = Record<string, IPTCFieldWithValue[]>

const fileStates = ref<FileState>({})
const isLoading = ref(true)

export default function useFileState() {
  const { loadedFiles, updateMetadata, reloadFiles, markAsDownloaded } = useFiles()

  if (!import.meta.env.SSR) {
    loadFileStatesFromIndexedDB()
  }

  async function loadFileStatesFromIndexedDB() {
    const { data: states, isFinished } = useIDBKeyval<FileState>('file-states', {})

    await until(isFinished).toBe(true)

    fileStates.value = states.value
    isLoading.value = false
  }

  async function updateIdb() {
    const { set } = useIDBKeyval<FileState>('file-states', fileStates.value)
    await set(toRaw(fileStates.value))
  }

  function setupState() {
    const state = iptcIimFields.map(field => ({
      ...field,
      value: '',
      original: '',
    }))

    return state
  }

  function setupFileState(fileId: string) {
    fileStates.value[fileId] = setupState()
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
        if (!field.original) {
          field.original = field.value
        }
      }
      return field
    })
  }

  function hasFieldChanged(metadata: Record<string, any>, key: string, currentValue: string) {
    const originalValue = metadata[key] || ''
    return originalValue !== currentValue
  }

  function fileChanges(fileId: string) {
    const file = loadedFiles.value.find(file => file.id === fileId)
    if (!file) {
      return 0
    }

    const state = getFileState(fileId)
    let changes = 0

    state.forEach((field) => {
      const originalValue = file.metadata[field.key] || ''
      if (originalValue !== field.value) {
        changes++
      }
    })

    return changes
  }

  const filesChanged = ref(0)

  function stateIndexByKey(state: IPTCFieldWithValue[], key: string) {
    const field = state.find(f => f.key === key)

    if (!field) {
      throw new Error(`Field with key ${key} not found in state`)
    }

    return state.indexOf(field)
  }

  function saveAll() {
    if (!filesChanged.value) {
      return
    }

    const statesToSave = Object.entries(fileStates.value).filter(([fileId, _]) => fileChanges(fileId) > 0).map(([fileId, state]) => ({
      fileId,
      state,
    }))

    statesToSave.forEach(({ fileId, state }) => {
      const file = loadedFiles.value.find(file => file.id === fileId)
      if (!file) {
        throw new Error('File not found for saving metadata')
      }

      updateMetadata(file, state)
    })

    const toast = useToast()

    const toastTitle = supported ? `${statesToSave.length} file${statesToSave.length === 1 ? '' : 's'} saved successfully.` : ` ${statesToSave.length} file${statesToSave.length === 1 ? ' has' : 's have'} been downloaded with updated metadata.`

    toast.add({
      title: toastTitle,
      duration: 3000,
      color: 'success',
    })

    if (supported) {
      reloadFiles()
    }
    else {
      markAsDownloaded(statesToSave.map(s => s.fileId))
    }
  }

  watchDeep(() => fileStates.value, async (updatedStates) => {
    const totalChanges = Object.keys(updatedStates).filter(fileId => fileChanges(fileId) > 0).length
    filesChanged.value = totalChanges

    await updateIdb()
  })

  return {
    fileStates,
    setupFileState,
    removeFileState,
    getFileState,
    updateFileData,
    hasFieldChanged,
    fileChanges,
    filesChanged,
    saveAll,
    stateIndexByKey,
  }
}
