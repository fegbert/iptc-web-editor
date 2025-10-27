<script setup lang="ts">
import type { FileWithMetadata } from '~/shared/types'

const { loadedFiles, isLoading, fileAmount, removeFile, toggleSelection } = useFiles()

const { shift, ctrl } = useMagicKeys()

function toggleFileSelection(file: FileWithMetadata) {
  const modifier = shift?.value ? 'shift' : ctrl?.value ? 'ctrl' : undefined
  toggleSelection(file, modifier)
}
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
      <FileList
        v-else-if="!isLoading && loadedFiles.length > 0"
        :files="loadedFiles"
        class="FileContainer"
        :class="{ DisableSelection: shift }"
        @select="toggleFileSelection"
        @remove="removeFile"
      />
      <div v-else class="flex flex-col items-center text-center gap-1">
        <span class="font-semibold">No files loaded yet.</span>
        <span class="text-sm text-default/75">Click the "Load Files" button to get started!</span>
      </div>
    </UDashboardSidebar>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Edit Metadata">
          <template #right>
            <EditorSaveButton />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <USkeleton v-if="isLoading" class="h-full" />
        <EditorContainer v-else class="w-full h-full" />
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

.DisableSelection {
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */
}
</style>
