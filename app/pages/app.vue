<script setup lang="ts">
const { loadedFiles, isLoading } = useFiles()
</script>

<template>
  <UDashboardGroup class="Dashboard">
    <UDashboardSidebar class="Sidebar">
      <template #header>
        <div class="flex flex-col w-full h-[var(--u-header-height)]">
          <FileLoadButton />
        </div>
      </template>
      <FileList v-if="!isLoading" :files="loadedFiles" />
      <USkeleton v-else class="h-full" />
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
</style>
