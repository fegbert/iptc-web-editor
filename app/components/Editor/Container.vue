<script setup lang="ts">
import { iptcIimMapping } from '~/utils/iptc-iim/mapping'

const { loadedFiles, updateMetadata } = useFiles()

const selectedFiles = computed(() => {
  return loadedFiles.value.filter(file => file.isSelected)
})

const selectedFile = computed(() => selectedFiles.value[0] || null)

const editableFields = iptcIimMapping.filter(field => field.key.startsWith('2'))

const state = ref(editableFields.map(field => ({
  key: field.key,
  title: field.title,
  value: '',
})))

watch(selectedFile, (newFile) => {
  if (newFile) {
    Object.entries(newFile.metadata).forEach(([key, value]) => {
      state.value = state.value.map(field => field.key === key ? { ...field, value } : field)
    })
  }
  else {
    state.value = state.value.map(field => ({ ...field, value: '' }))
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
                <div v-for="field in state" :key="field.key">
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
