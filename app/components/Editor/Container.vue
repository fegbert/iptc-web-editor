<script setup lang="ts">
const { loadedFiles } = useFiles()

const selectedFiles = computed(() => {
  return loadedFiles.value.filter(file => file.isSelected)
})

const selectedFile = computed(() => selectedFiles.value[0] || null)
// state = useState()

const { updateFileData, getFileState } = useFileState()

const selectedState = computed(() => getFileState(selectedFile.value?.id || ''))

// state.update(file)
// state.original(file) -> file.metadata
// state.changes() -> number of changed files

watch(selectedFile, (newFile) => {
  if (newFile) {
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
            <div class="flex w-full items-center justify-between">
              <span>IPTC-IIM</span>
              <!--
              <UButton v-if="selectedFile" icon="i-lucide-save" size="sm" color="primary" @click.stop="updateMetadata(selectedFile, state)">
                Save changes
              </UButton>
              -->
            </div>
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
