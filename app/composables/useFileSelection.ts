import type { FileWithMetadata } from '~/shared/types'

const ALLOW_MULTIPLE_SELECTION = false
const IDB_KEY_SELECTED_FILES = 'selected-files'

const selectedFileIds = ref<Set<string>>(new Set())

export default function useFileSelection() {
  async function loadselectedFileIdsFromIndexedDB() {
    const files = await loadFromIdb<string[]>(IDB_KEY_SELECTED_FILES, [])
    selectedFileIds.value = new Set(files ?? [])
  }

  async function update(fileIds: Set<string>) {
    await updateIdb<string[]>(IDB_KEY_SELECTED_FILES, Array.from(fileIds))
    await loadselectedFileIdsFromIndexedDB()
  }

  async function toggleSelection(file: FileWithMetadata, modifier: 'shift' | 'ctrl' | undefined = undefined) {
    if (ALLOW_MULTIPLE_SELECTION) {
      if (modifier === 'shift') {
        if (selectedFileIds.value.size === 0) {
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

    await update(selectedFileIds.value)
  }

  /* TODO: Reimplement shift selection
  function handleShiftSelect(fileIndex: number, lastSelectedIndex: number) {
    const [start, end] = fileIndex < lastSelectedIndex ? [fileIndex, lastSelectedIndex] : [lastSelectedIndex, fileIndex]
    selectedIndexes.value.push(...Array.from({ length: end - start + 1 }, (_, i) => start + i))
  }
  */

  function handleCtrlSelect(fileId: string) {
    isSelected(fileId) ? selectedFileIds.value.add(fileId) : selectedFileIds.value.delete(fileId)
  }

  function handleNormalSelect(fileId: string) {
    const areMoreSelected = selectedFileIds.value.size > 1
    const isSelectedBefore = isSelected(fileId)

    if (isSelectedBefore && areMoreSelected) {
      selectedFileIds.value.clear()
      selectedFileIds.value.add(fileId)
    }
    else {
      if (isSelectedBefore) {
        selectedFileIds.value.clear()
      }
      else {
        selectedFileIds.value.clear()
        selectedFileIds.value.add(fileId)
      }
    }
  }

  function isSelected(fileId: string): boolean {
    return selectedFileIds.value.has(fileId)
  }

  const firstFileId = computed(() => {
    if (selectedFileIds.value.size === 0) {
      return null
    }

    return selectedFileIds.value.values().next().value
  })

  return { toggleSelection, selectedFileIds, update, isSelected, firstFileId }
}
