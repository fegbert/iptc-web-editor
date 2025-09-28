<script setup lang="ts">
const { loadedFiles, updateMetadata } = useFiles()

const selectedFiles = computed(() => {
  return loadedFiles.value.filter(file => file.isSelected)
})

const selectedFile = computed(() => selectedFiles.value[0] || null)

const state = ref({
  '2:105': {
    title: 'Headline',
    value: '',
  },
  '2:110': {
    title: 'Credit',
    value: '',
  },
})

watch(selectedFile, (newFile) => {
  if (newFile) {
    state.value['2:105'].value = newFile.metadata['2:105'] || ''
  }
  else {
    state.value['2:105'].value = ''
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
              <UButton v-if="selectedFile" icon="i-lucide-save" size="sm" color="primary" @click.stop="updateMetadata(selectedFile, state)">
                Save changes
              </UButton>
            </div>
          </UButton>
          <template #content>
            <div class="py-4">
              <UForm :state="state">
                <EditorField v-model="state['2:105'].value" :name="state['2:105'].title" type="text" class="w-1/4" />
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
