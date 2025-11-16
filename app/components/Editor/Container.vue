<script setup lang="ts">
const { selectedFiles } = useFiles()
const selectedFile = computed(() => selectedFiles.value[0] || null)

const { updateFileData, getFileState, setupFileState } = useFileState()

const selectedState = computed(() => getFileState(selectedFile.value?.id || ''))

watch(selectedFile, (newFile) => {
  if (newFile) {
    if (getFileState(newFile.id).length === 0) {
      setupFileState(newFile.id)
      return
    }
    Object.entries(newFile.metadata).forEach(([key, value]) => updateFileData(newFile.id, key, value))
  }
}, { immediate: true })
</script>

<template>
  <div class="w-full h-full">
    <template v-if="selectedFiles.length > 0">
      <EditorFileInformation class="bg-accented/20 rounded-lg" :files="selectedFiles" />
      <div class="pt-8 pb-14">
        <BaseCollapsible>
          <template #title>
            <span>IPTC-IIM</span>
          </template>

          <template #content>
            <div class="py-4">
              <UForm v-if="selectedFile" :state="selectedState">
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
