import type { FileWithMetadata } from '~/shared/types'

type FileSelection = Record<string, boolean>

const ALLOW_MULTIPLE_SELECTION = false
const IDB_KEY_SELECTED_FILES = 'selected-files'

const selections = ref<FileSelection>({})

export default function useFileSelection() {
  async function loadSelectedFileIdsFromIndexedDB() {
    if (import.meta.env.SSR) {
      return
    }

    const files = await loadFromIdb<FileSelection>(IDB_KEY_SELECTED_FILES, {})
    selections.value = files ?? {}
  }

  function getSelectedIds(): string[] {
    return Object.entries(selections.value).filter(([_, isSelected]) => isSelected).map(([fileId, _]) => fileId)
  }

  function toggleSelection(file: FileWithMetadata, modifier: 'shift' | 'ctrl' | undefined = undefined) {
    if (ALLOW_MULTIPLE_SELECTION) {
      if (modifier === 'shift') {
        if (getSelectedIds().length === 0) {
          handleNormalSelect(file.id)
        }
        else {
          // TODO: reimplement shift selection
          // const lastSelectedIndex = selectedIndexes.value[selectedIndexes.value.length - 1] ?? 0
          // handleShiftSelect(selectedFileIndex, lastSelectedIndex)
        }
      }
      else if (modifier === 'ctrl') {
        handleCtrlSelect(file.id)
      }
    }
    else {
      handleNormalSelect(file.id)
    }
  }

  /* TODO: Reimplement shift selection
  function handleShiftSelect(fileIndex: number, lastSelectedIndex: number) {
    const [start, end] = fileIndex < lastSelectedIndex ? [fileIndex, lastSelectedIndex] : [lastSelectedIndex, fileIndex]
    selectedIndexes.value.push(...Array.from({ length: end - start + 1 }, (_, i) => start + i))
  }
  */

  function handleCtrlSelect(fileId: string) {
    selections.value[fileId] = !selections.value[fileId]
  }

  function handleNormalSelect(fileId: string) {
    const areMoreSelected = getSelectedIds().length > 1
    const isSelectedBefore = isSelected(fileId)

    deselectAll()

    if ((isSelectedBefore && areMoreSelected) || !isSelectedBefore) {
      selections.value[fileId] = true
    }
  }

  function deselectAll() {
    Object.keys(selections.value).forEach((key) => {
      selections.value[key] = false
    })
  }

  function isSelected(fileId: string): boolean {
    return selections.value[fileId] ?? false
  }

  const firstSelectedId = computed(() => {
    const selectedIds = getSelectedIds()
    return selectedIds.length > 0 ? selectedIds[0] : null
  })

  const firstSelectedFile = computed(() => {
    const { loadedFiles } = useFiles()
    return firstSelectedId.value ? loadedFiles.value[firstSelectedId.value] : null
  })

  return { toggleSelection, selections, isSelected, firstSelectedId, firstSelectedFile, loadSelectedFileIdsFromIndexedDB, getSelectedIds }
}
