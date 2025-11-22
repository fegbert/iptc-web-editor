<script setup lang="ts">
const { firstFileId } = useFileSelection()
const { fileChanges } = useFileState()
const { fileById } = useFiles()

const firstFile = computed(() => firstFileId.value ? fileById(firstFileId.value) : undefined)

const amountOfChanges = computed(() => {
  if (!firstFileId.value) {
    return 0
  }

  return fileChanges(firstFileId.value)
})
</script>

<template>
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
        <div>
          <slot name="title" />
        </div>
        <span v-if="amountOfChanges && firstFile && !firstFile.isDownloaded" class="text-sm text-gray-400">
          {{ amountOfChanges }} unsaved change{{ amountOfChanges === 1 ? '' : 's' }}
        </span>
      </div>
    </UButton>
    <template #content>
      <slot name="content" />
    </template>
  </UCollapsible>
</template>
