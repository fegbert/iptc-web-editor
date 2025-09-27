import type { FileWithHandle } from 'browser-fs-access'
import type { FileWithMetadata } from '~/shared/types'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'
import { parseMetadata } from 'iptc-parser'

const loadedFiles = ref<FileWithMetadata[]>([])
const isLoading = ref(true)
const fileAmount = ref(0)
const selectedIndexes = ref<number[]>([])

function loadFilesFromIndexedDB() {
  const { data: files, isFinished } = useIDBKeyval<FileWithMetadata[]>('uploaded-images', [])
  const { data: indexes, isFinished: areIndexesFinished } = useIDBKeyval<number[]>('selected-indexes', [])

  watch(() => isFinished.value, (newVal) => {
    if (newVal) {
      loadedFiles.value = files.value
      isLoading.value = false

      const amountCookie = useCookie('file-amount')
      amountCookie.value = String(loadedFiles.value.length)
    }
  })

  watch(() => areIndexesFinished.value, (newVal) => {
    if (newVal) {
      selectedIndexes.value = indexes.value
    }
  })
}

function loadAmountFromCookies() {
  const amountCookie = useCookie('file-amount')
  fileAmount.value = Number.parseInt(amountCookie.value ?? '0')
}

function deduplicateFiles(files: FileWithMetadata[]) {
  const dedupedIds = new Set()

  return files.filter((file) => {
    const id = file.file.name + file.file.lastModified + file.file.size
    if (dedupedIds.has(id)) {
      return false
    }
    dedupedIds.add(id)
    return true
  })
}

async function updateIdb(updatedFiles: FileWithMetadata[]) {
  const { set } = useIDBKeyval<FileWithMetadata[]>('uploaded-images', loadedFiles.value)
  await set(updatedFiles)

  const { set: setIndexes } = useIDBKeyval<number[]>('selected-indexes', selectedIndexes.value)
  await setIndexes(toRaw(selectedIndexes.value))

  loadFilesFromIndexedDB()
}

async function addFiles(files: FileWithHandle[]) {
  const metadataMapping: FileWithMetadata[] = await Promise.all(files.map(async (file) => {
    const buffer = await file.arrayBuffer()

    try {
      const metadata = parseMetadata(new Uint8Array(buffer))
      return {
        file,
        metadata,
      }
    }
    catch (e) {
      console.warn('Failed to find metadata for file: ', file.name, ' - ', e)
      return {
        file,
        metadata: {},
      }
    }
  }))

  const rawLoadedFiles = toRaw(loadedFiles.value)
  const dedupedUpdatedFiles = deduplicateFiles([...rawLoadedFiles, ...metadataMapping])

  updateIdb(dedupedUpdatedFiles)
}

async function removeFile(fileToRemove: FileWithMetadata) {
  if (fileToRemove.isSelected) {
    const indexToRemove = loadedFiles.value.findIndex(file => file.file === fileToRemove.file)
    if (indexToRemove === -1) {
      return
    }
    selectedIndexes.value = selectedIndexes.value.filter(index => index !== indexToRemove)
  }

  const updatedFiles = loadedFiles.value.filter(file => file.file !== fileToRemove.file).map(file => toRaw(file))
  updateIdb(updatedFiles)
}


async function toggleSelection(file: FileWithMetadata, modifier: 'shift' | 'ctrl' | undefined = undefined) {
  const selectedFileIndex = loadedFiles.value.findIndex(f => f.file === file.file)

  if (selectedFileIndex === -1) {
    return
  }

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
  else {
    handleNormalSelect(selectedFileIndex)
  }

  const rawFiles = loadedFiles.value.map(file => toRaw(file))
  await updateIdb(rawFiles)
}

function handleShiftSelect(fileIndex: number, lastSelectedIndex: number) {
  const [start, end] = fileIndex < lastSelectedIndex ? [fileIndex, lastSelectedIndex] : [lastSelectedIndex, fileIndex]

  loadedFiles.value = loadedFiles.value.map((loadedFile, index) => {
    loadedFile.isSelected = index >= start && index <= end
    return loadedFile
  })
}

function handleCtrlSelect(fileIndex: number) {
  if (!loadedFiles.value[fileIndex]) {
    return
  }

  const isSelected = loadedFiles.value[fileIndex].isSelected

  if (!isSelected) {
    selectedIndexes.value.push(fileIndex)
  }
  else {
    selectedIndexes.value = selectedIndexes.value.filter(i => i !== fileIndex)
  }

  loadedFiles.value[fileIndex].isSelected = !isSelected
}

function handleNormalSelect(fileIndex: number) {
  if (!loadedFiles.value[fileIndex]) {
    return
  }

  const otherIndexes = selectedIndexes.value.filter(i => i !== fileIndex)
  const isSelectedBefore = !loadedFiles.value[fileIndex].isSelected

  loadedFiles.value = loadedFiles.value.map((loadedFile, index) => {
    if (index !== fileIndex) {
      loadedFile.isSelected = false
      return loadedFile
    }

    if (otherIndexes.length > 0) {
      loadedFile.isSelected = true
    }
    else {
      loadedFile.isSelected = !loadedFile.isSelected
    }

    return loadedFile
  })

  if (isSelectedBefore || otherIndexes.length > 0) {
    selectedIndexes.value = [fileIndex]
  }
  else {
    selectedIndexes.value = []
  }
}

export default function () {
  if (!import.meta.env.SSR) {
    loadFilesFromIndexedDB()
  }

  loadAmountFromCookies()

  return { loadedFiles, isLoading, loadFilesFromIndexedDB, addFiles, removeFile, fileAmount, toggleSelection }
}
