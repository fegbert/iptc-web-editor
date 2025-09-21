<script setup lang="ts">
const { loadedFiles, isLoading, fileAmount } = useFiles()
</script>

<template>
  <UDashboardGroup class="Dashboard">
    <UDashboardSidebar class="Sidebar" :default-size="20">
      <template #header>
        <div class="flex flex-col w-full h-[var(--u-header-height)]">
          <FileLoadButton />
        </div>
      </template>
      <div v-if="isLoading && fileAmount > 0" class="flex flex-col gap-2">
        <FileSkeleton v-for="i in fileAmount" :key="i" />
      </div>
      <FileList v-else-if="!isLoading && loadedFiles.length > 0" :files="loadedFiles" class="FileContainer" />
      <div v-else class="flex flex-col items-center text-center gap-1">
        <span class="font-semibold">No files loaded yet.</span>
        <span class="text-sm text-default/75">Click the "Load Files" button to get started!</span>
      </div>
    </UDashboardSidebar>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Edit Metadata" />
      </template>

      <template #body>
        <USkeleton class="h-full" />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<style scoped>
.Dashboard {
  position: inherit !important;
  padding-top: var(--u-header-height);
  max-height: calc(100vh - 6.5vh) !important;
}

.FileContainer {
  max-height: calc(100vh - 6.5vh - 64px) !important;
}
</style>
