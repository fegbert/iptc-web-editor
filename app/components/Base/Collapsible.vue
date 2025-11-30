<script setup lang="ts">
defineProps<{
  defaultOpen?: boolean
  disabled?: boolean
}>()

const { firstSelectedFile } = useFileSelection()
const { fileChanges } = useFileState()

const amountOfChanges = computed(() => {
  if (!firstSelectedFile.value) {
    return 0
  }

  return fileChanges(firstSelectedFile.value.id)
})
</script>

<template>
  <UCollapsible :default-open="defaultOpen" :disabled="disabled">
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
      :disabled="disabled"
    >
      <div class="flex w-full items-center justify-between">
        <div class="font-semibold">
          <slot name="title" />
        </div>
        <span v-if="amountOfChanges && firstSelectedFile && !firstSelectedFile.isDownloaded && !disabled" class="text-sm text-gray-400">
          {{ amountOfChanges }} unsaved change{{ amountOfChanges === 1 ? '' : 's' }}
        </span>
      </div>
    </UButton>
    <template #content>
      <slot name="content" />
    </template>
  </UCollapsible>
</template>
