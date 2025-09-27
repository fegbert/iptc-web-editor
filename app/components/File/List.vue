<script setup lang="ts">
import type { FileWithMetadata } from '~/shared/types'

defineProps<{
  files: FileWithMetadata[]
}>()
</script>

<template>
  <div class="flex flex-col gap-2 overflow-y-auto pb-2">
    <div v-for="file in files" :key="`${file.file.name}-${file.file.size}`">
      <FilePreview :image="file" show-details :width="64" :height="64" />
    </div>
  </div>
</template>
