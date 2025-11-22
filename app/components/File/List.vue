<script setup lang="ts">
import type { FileWithMetadata } from '~/shared/types'

defineProps<{
  files: FileWithMetadata[]
}>()

const emit = defineEmits<{
  (e: 'select', file: FileWithMetadata): void
  (e: 'remove', file: FileWithMetadata): void
}>()
</script>

<template>
  <div class="flex flex-col gap-2 overflow-y-auto pb-2">
    <div v-for="(file, index) in files" :key="`${file.file.name}-${file.file.size}`">
      <FilePreview
        :image="file"
        :index="index"
        :width="64"
        :height="64"
        show-details
        @select="emit('select', $event)"
        @remove="emit('remove', $event)"
      />
    </div>
  </div>
</template>
