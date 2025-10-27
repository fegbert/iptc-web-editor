<script setup lang="ts">
const { loadedFiles } = useFiles()

const selectedFiles = computed(() => {
  return loadedFiles.value.filter(file => file.isSelected)
})

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
      <div class="pt-8">
        <UCollapsible default-open>
          <UButton
            class="group"
            color="neutral"
            variant="subtle"
            size="xl"
            trailing-icon="i-lucide-chevron-down"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            block
          >
            <span>IPTC-IIM</span>
          </UButton>
          <template #content>
            <div class="py-4">
              <UForm :state="selectedState">
                <div v-for="field in selectedState" :key="field.key">
                  <EditorField v-model="field.value" :name="field.title" type="text" class="w-1/4" />
                </div>
              </UForm>
            </div>
          </template>
        </UCollapsible>
      </div>
    </template>
    <template v-else>
      <p>No files selected!</p>
    </template>
  </div>
</template>
