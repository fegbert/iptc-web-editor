<script setup lang="ts">

</script>

<template>
  <UDashboardGroup class="Dashboard">
    <UDashboardSidebar />
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
