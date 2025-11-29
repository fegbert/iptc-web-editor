<script setup lang="ts">
import type { FileWithMetadata } from '~/shared/types'

defineProps<{
  files: FilesIdb
}>()

const emit = defineEmits<{
  (e: 'select', file: FileWithMetadata): void
  (e: 'remove', fileId: string): void
  (e: 'reset', fileId: string): void
}>()
</script>

<template>
  <div class="flex flex-col gap-2 overflow-y-auto pb-2">
    <div v-for="file in Object.values(files)" :key="`${file.file.name}-${file.file.size}`">
      <FilePreview
        :image="file"
        :width="64"
        :height="64"
        show-details
        @select="emit('select', $event)"
        @remove="emit('remove', $event)"
        @reset="emit('reset', $event)"
      />
    </div>
  </div>
</template>
