<script setup lang="ts">
import type { FileWithHandle } from 'browser-fs-access'

defineProps<{
  files: FileWithHandle[]
}>()
</script>

<template>
  <div class="flex flex-col gap-2 overflow-y-scroll pb-2">
    <div v-for="file in files" :key="`${file.name}-${file.size}`">
      <FilePreview :file="file" show-details :width="64" :height="64" />
    </div>
  </div>
</template>
