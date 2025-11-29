<script setup lang="ts">
const { getSelectedIds, firstSelectedFile } = useFileSelection()
const { getFileState } = useFileState()

const selectedState = computed(() => getFileState(firstSelectedFile.value?.id || ''))
const fileId = computed(() => firstSelectedFile.value?.id || '')
</script>

<template>
  <div v-if="firstSelectedFile" class="w-full h-full">
    <EditorFileInformation class="bg-accented/20 rounded-lg" :file-ids="getSelectedIds()" />
    <div class="pt-8 pb-14">
      <BaseCollapsible v-if="selectedState.length > 0">
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
    </div>
  </div>
  <div v-else>
    <p>No files selected!</p>
  </div>
</template>
