<script setup lang="ts">
const { getSelectedIds, firstSelectedFile } = useFileSelection()
const { getFileState } = useFileState()

const selectedState = computed(() => getFileState(firstSelectedFile.value?.id || ''))
const fileId = computed(() => firstSelectedFile.value?.id || '')
</script>

<template>
  <div v-if="firstSelectedFile && selectedState.length > 0" class="w-full h-full pr-4 sm:pr-6">
    <EditorFileInformation class="bg-accented/20 rounded-lg" :file-ids="getSelectedIds()" />
    <div class="flex flex-col w-full gap-4 pt-8">
      <BaseCollapsible :default-open="true">
        <template #title>
          <span>IPTC-IIM</span>
        </template>

        <template #content>
          <div class="py-4">
            <UForm v-if="firstSelectedFile" :state="selectedState">
              <EditorCategories v-model="selectedState" :file-id="fileId" />
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
