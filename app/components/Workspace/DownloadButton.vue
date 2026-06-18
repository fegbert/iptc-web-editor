<script setup lang="ts">
const { download, isDownloading } = useWorkspace()
const { selectedIds } = useFileSelection()
</script>

<template>
  <UButton
    icon="i-lucide-download"
    class="w-full font-semibold text-nowrap"
    :loading="isDownloading"
    @click="download"
  >
    Download {{ selectedIds.length }} File{{ selectedIds.length !== 1 ? 's' : '' }}
  </UButton>
</template>
