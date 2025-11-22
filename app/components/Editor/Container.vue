<script setup lang="ts">
const { selectedFileIds, firstFileId } = useFileSelection()
const { fileById } = useFiles()
const { getFileState, setupFileState } = useFileState()

const firstFile = computed(() => firstFileId.value ? fileById(firstFileId.value) : undefined)

const selectedState = computed(() => getFileState(firstFile.value?.id || ''))

watch(firstFile, (newFile) => {
  if (newFile && getFileState(newFile.id).length === 0) {
    setupFileState(newFile.id)
  }
}, { immediate: true })
</script>

<template>
  <div class="w-full h-full">
    <template v-if="firstFileId">
      <EditorFileInformation class="bg-accented/20 rounded-lg" :file-ids="selectedFileIds" />
      <div class="pt-8 pb-14">
        <BaseCollapsible>
          <template #title>
            <span>IPTC-IIM</span>
          </template>

          <template #content>
            <div class="py-4">
              <UForm v-if="firstFile" :state="selectedState">
                <EditorCategories v-model="selectedState" />
              </UForm>
            </div>
          </template>
        </BaseCollapsible>
      </div>
    </template>
    <template v-else>
      <p>No files selected!</p>
    </template>
  </div>
</template>
