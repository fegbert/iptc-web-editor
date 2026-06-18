<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const { firstSelectedId, selectedIds } = useFileSelection()
const { getFileState, updateFileData } = useFileState()
const { loadedFiles } = useFiles()

const isMultiple = computed(() => selectedIds.value.length > 1)

// Single File - directly reference to fileStates
const singleFileState = computed({
  get: () => getFileState(firstSelectedId.value ?? ''),
  set: () => {},
})

// Multiple Files - independent copies so mutations don't bleed into per file state
const multiState = ref<IPTCFieldWithValue[]>([])
const multiSnapshot = ref<Record<string, string>>({})

function buildMerged() {
  const ids = selectedIds.value
  if (ids.length === 0) {
    return []
  }

  const states = ids.map(id => getFileState(id))
  return states[0]!.map((field, index) => {
    const values = states.map(state => state?.[index]?.value ?? '')
    const allSame = values.every(value => value === values[0])
    return { ...field, value: allSame ? values[0] : '' }
  })
}

watch(selectedIds, () => {
  if (!isMultiple.value) {
    return
  }

  const merged = buildMerged()
  multiState.value = merged.map(field => ({ ...field, value: field.value ?? '' }))
  multiSnapshot.value = Object.fromEntries(merged.map(field => [field.key, field.value ?? '']))
}, { immediate: true })

watch(multiState, (newState) => {
  if (!isMultiple.value) {
    return
  }

  newState.forEach((field) => {
    if (field.value !== multiSnapshot.value[field.key]) {
      selectedIds.value.forEach(id => updateFileData(id, field.key, field.value))
      multiSnapshot.value[field.key] = field.value
    }
  })
}, { deep: true })

function isMixed(key: string): boolean {
  if (selectedIds.value.length <= 1) return false
  const values = selectedIds.value.map(id => getFileState(id).find(state => state.key === key)?.value ?? '')
  return new Set(values).size > 1
}

function getMixedValues(key: string) {
  return selectedIds.value.map(fileId => ({
    fileId,
    fileName: loadedFiles.value[fileId]?.data.name ?? 'Unknown',
    value: getFileState(fileId).find(state => state.key === key)?.value ?? '',
  }))
}

provide('editorMultiFile', { isMixed, getMixedValues })
</script>

<template>
  <div v-if="firstSelectedId || isMultiple" class="w-full h-full pr-4 sm:pr-6">
    <EditorFileInformation class="bg-accented/20 rounded-lg" />
    <div class="flex flex-col w-full gap-4 pt-8">
      <BaseCollapsible :default-open="true">
        <template #title>
          <span>IPTC-IIM</span>
        </template>

        <template #content>
          <div class="py-4">
            <UForm v-if="isMultiple" :state="multiState">
              <EditorCategories v-model="multiState" file-id="" />
            </UForm>
            <UForm v-else-if="firstSelectedId" :state="singleFileState">
              <EditorCategories v-model="singleFileState" :file-id="firstSelectedId" />
            </UForm>
          </div>
        </template>
      </BaseCollapsible>
      <BaseCollapsible :disabled="true">
        <template #title>
          <div class="flex items-center gap-2">
            <span>IPTC Core & Extension</span>
            <UBadge color="warning" variant="subtle" size="sm">
              COMING SOON
            </UBadge>
          </div>
        </template>
      </BaseCollapsible>
    </div>
  </div>
  <div v-else class="w-full h-[80vh] flex items-center justify-center">
    <UEmpty size="xl" variant="naked" title="No file selected" description="Select a file to begin editing its metadata" icon="i-lucide-file-minus" />
  </div>
</template>
