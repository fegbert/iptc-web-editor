import type { FileWithMetadata } from '~/shared/types'

const ALLOW_MULTIPLE_SELECTION = false
const IDB_KEY_INDEXES = 'selected-indexes'

const selectedIndexes = ref<number[]>([])

export default function useFileSelection() {
  async function loadIndexesFromIndexedDB() {
    const indexes = await loadFromIdb<number[]>(IDB_KEY_INDEXES, [])
    selectedIndexes.value = indexes ?? []
  }

  async function update(indexes: number[]) {
    await updateIdb<number[]>(IDB_KEY_INDEXES, indexes)
    await loadIndexesFromIndexedDB()
  }

  async function toggleSelection(file: FileWithMetadata, modifier: 'shift' | 'ctrl' | undefined = undefined) {
    const { loadedFiles, update: updateFiles } = useFiles()
    const selectedFileIndex = loadedFiles.value.findIndex(f => f.file === file.file)

    if (selectedFileIndex === -1) {
      return
    }

    if (ALLOW_MULTIPLE_SELECTION) {
      if (modifier === 'shift') {
        if (selectedIndexes.value.length === 0) {
          handleNormalSelect(selectedFileIndex)
        }
        else {
          const lastSelectedIndex = selectedIndexes.value[selectedIndexes.value.length - 1] ?? 0
          handleShiftSelect(selectedFileIndex, lastSelectedIndex)
        }
      }
      else if (modifier === 'ctrl') {
        handleCtrlSelect(selectedFileIndex)
      }
    }
    else {
      handleNormalSelect(selectedFileIndex)
    }

    await updateFiles(loadedFiles.value)
    await update(selectedIndexes.value)
  }

  function handleShiftSelect(fileIndex: number, lastSelectedIndex: number) {
    const [start, end] = fileIndex < lastSelectedIndex ? [fileIndex, lastSelectedIndex] : [lastSelectedIndex, fileIndex]
    selectedIndexes.value.push(...Array.from({ length: end - start + 1 }, (_, i) => start + i))
  }

  function handleCtrlSelect(fileIndex: number) {
    if (!isSelected(fileIndex)) {
      selectedIndexes.value.push(fileIndex)
    }
    else {
      selectedIndexes.value = selectedIndexes.value.filter(i => i !== fileIndex)
    }
  }

  function handleNormalSelect(fileIndex: number) {
    const otherIndexes = selectedIndexes.value.filter(i => i !== fileIndex)
    const isSelectedBefore = isSelected(fileIndex)

    if (isSelectedBefore && otherIndexes.length > 0) {
      selectedIndexes.value = [fileIndex]
    }
    else {
      selectedIndexes.value = isSelectedBefore ? [] : [fileIndex]
    }
  }

  function isSelected(fileIndex: number): boolean {
    return selectedIndexes.value.includes(fileIndex)
  }

  return { toggleSelection, selectedIndexes, update, isSelected }
}
