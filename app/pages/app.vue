<script setup lang="ts">
import type { FileWithMetadata } from '~/shared/types'

const { loadedFiles, selectedFiles, isLoading, fileAmount, removeFile, toggleSelection } = useFiles()
const { removeFileState } = useFileState()

const { shift, ctrl } = useMagicKeys()

function toggleFileSelection(file: FileWithMetadata) {
  const modifier = shift?.value ? 'shift' : ctrl?.value ? 'ctrl' : undefined
  toggleSelection(file, modifier)
}

async function remove(file: FileWithMetadata) {
  await removeFile(file)
  removeFileState(file.id)
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
        @remove="remove"
      />
      <UEmpty
        v-else
        title="No Files found"
        description="Upload some files using the button above to get started!"
      >
        <template #title>
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 flex items-center justify-center rounded-full bg-accented/50">
              <UIcon name="i-lucide-file-minus" class="w-4 h-4 bg-neutral-500" />
            </div>
            <span>No Files loaded yet</span>
          </div>
        </template>
      </UEmpty>
    </UDashboardSidebar>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Edit Metadata">
          <template #right>
            <EditorSaveButton v-if="selectedFiles.length > 0" />
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
