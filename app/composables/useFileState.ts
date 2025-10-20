import type { Field } from '~/shared/types'
import { iptcIimMapping } from '~/utils/iptc-iim/mapping'

export default function useFileState() {
  const fileStates = useState<Record<string, Field[]>>('file-states', () => ({}))

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

  return {
    fileStates,
    setupFileState,
    removeFileState,
    getFileState,
    updateFileData,
  }
}
