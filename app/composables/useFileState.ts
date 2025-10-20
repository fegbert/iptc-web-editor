import type { Field } from '~/shared/types'
import { iptcIimMapping } from '~/utils/iptc-iim/mapping'

export default function useFileState() {
  const fileStates = useState<Record<string, Field[]>>('file-states', () => ({}))
  const { loadedFiles } = useFiles()

  function setupState() {
    const editableFields = iptcIimMapping.filter(field => field.key.startsWith('2'))

    const state = editableFields.map(field => ({
      key: field.key,
      title: field.title,
      value: '',
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

  function updateFileData(fileId: string, key: string, newValue: string) {
    if (!fileStates.value[fileId]) {
      setupFileState(fileId)
    }

    fileStates.value[fileId]!.map((field) => {
      if (field.key === key) {
        field.value = newValue
      }
      return field
    })
  }

  function hasFieldChanged(fileId: string, key: string, currentValue: string) {
    const file = loadedFiles.value.find(file => file.id === fileId)
    if (!file) {
      return false
    }

    const originalValue = file.metadata[key] || ''
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

  return {
    fileStates,
    setupFileState,
    removeFileState,
    getFileState,
    updateFileData,
    hasFieldChanged,
    fileChanges,
  }
}
