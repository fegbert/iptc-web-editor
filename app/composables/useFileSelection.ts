import type { FileWithMetadata } from '~/shared/types'

type FileSelection = Record<string, boolean>

const ALLOW_MULTIPLE_SELECTION = true
const IDB_KEY_SELECTED_FILES = 'selected-files'

const selections = ref<FileSelection>({})
const selectionHistory = ref<string[]>([])

export default function useFileSelection() {
  const { loadedFiles } = useFiles()

  async function loadSelectedFileIdsFromIndexedDB() {
    if (import.meta.env.SSR) {
      return
    }

    const files = await loadFromIdb<FileSelection>(IDB_KEY_SELECTED_FILES, {})
    selections.value = files ?? {}
  }

  const selectedIds = computed(() => Object.entries(selections.value).filter(([_, isSelected]) => isSelected).map(([fileId, _]) => fileId))

  function toggleSelection(file: FileWithMetadata, modifier: 'shift' | 'ctrl' | undefined = undefined) {
    if (!ALLOW_MULTIPLE_SELECTION) {
      modifier = undefined
    }

    if (modifier === 'shift') {
      if (selectedIds.value.length === 0) {
        handleNormalSelect(file.id)
      }
      else {
        handleShiftSelect(file.id)
      }
    }
    else if (modifier === 'ctrl') {
      handleCtrlSelect(file.id)
    }
    else {
      handleNormalSelect(file.id)
    }
  }

  function handleShiftSelect(fileId: string) {
    if (selectionHistory.value.length === 0) {
      return handleNormalSelect(fileId)
    }

    const lastSelectedId = selectionHistory.value[selectionHistory.value.length - 1]!

    const fileIds = Object.keys(loadedFiles.value)
    const lastSelectedIndex = fileIds.indexOf(lastSelectedId)
    const fileIndex = fileIds.indexOf(fileId)

    if (lastSelectedIndex === -1 || fileIndex === -1) {
      return
    }

    const [start, end] = fileIndex < lastSelectedIndex ? [fileIndex, lastSelectedIndex] : [lastSelectedIndex, fileIndex]

    fileIds.forEach((id) => {
      const fileIndex = fileIds.indexOf(id)
      selections.value[id] = fileIndex >= start && fileIndex <= end
    })
  }

  function handleCtrlSelect(fileId: string) {
    const toggleTo = !(selections.value[fileId] ?? false)
    selections.value[fileId] = toggleTo
    if (toggleTo) {
      selectionHistory.value.push(fileId)
    }
    else {
      selectionHistory.value.pop()
    }
  }

  function handleNormalSelect(fileId: string) {
    const areMoreSelected = selectedIds.value.length > 1
    const isSelectedBefore = isSelected(fileId)

    deselectAll()

    if ((isSelectedBefore && areMoreSelected) || !isSelectedBefore) {
      selections.value[fileId] = true
      selectionHistory.value.push(fileId)
    }
  }

  function deselectAll() {
    Object.keys(selections.value).forEach((key) => {
      selections.value[key] = false
    })
    selectionHistory.value = []
  }

  function isSelected(fileId: string): boolean {
    return selections.value[fileId] ?? false
  }

  const firstSelectedId = computed(() => {
    return selectedIds.value.length > 0 ? selectedIds.value[0] : null
  })

  const firstSelectedFile = computed(() => {
    const { loadedFiles } = useFiles()
    return firstSelectedId.value ? loadedFiles.value[firstSelectedId.value] : null
  })

  return { toggleSelection, selections, isSelected, firstSelectedId, firstSelectedFile, loadSelectedFileIdsFromIndexedDB, selectedIds }
}
