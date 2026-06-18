<script setup lang="ts">
import type { FileWithMetadata } from '~/shared/types'

definePageMeta({ middleware: 'workspace' })

const { $trpc } = useNuxtApp()
const { files, initFiles, disconnect, connect } = useWorkspaceSync()
const { clearStorage } = useWorkspace()
const { loadedFiles } = useFiles()
const { setupFileState, removeFileState } = useFileState()
const { selectedIds, toggleSelection } = useFileSelection()
const route = useRoute()

const isLoading = ref(true)

const adapterFiles = computed(() => Object.fromEntries(files.value.map(f => [f.id, workspaceFileToFileWithMetadata(f)])))

watch(adapterFiles, (adapted, previous) => {
  Object.keys(adapted).forEach((id) => {
    if (!previous?.[id]) {
      loadedFiles.value[id] = adapted[id]!
      setupFileState(id)
    }
    else {
      loadedFiles.value[id]!.metadata = adapted[id]!.metadata
    }
  })

  Object.keys(previous ?? {}).forEach((id) => {
    if (!adapted[id]) {
      delete loadedFiles.value[id]
      removeFileState(id)
    }
  })
})

async function load() {
  isLoading.value = true
  const result = await $trpc.file.list.query({})
  initFiles(result)
  isLoading.value = false
}

watch(() => route.params.orgId, async (orgId) => {
  const parsedOrgId = Array.isArray(orgId) ? orgId[0] : orgId
  if (!parsedOrgId) {
    return
  }

  const clerk = useClerk()
  await clerk.value?.setActive({ organization: parsedOrgId })

  disconnect()
  clearStorage()
  await load()
  connect(clerk.value?.organization?.id ?? parsedOrgId)
})

onUnmounted(() => {
  disconnect()
  clearStorage()
})

const editorContainer = ref(null)
const { y: scrollY } = useScroll(editorContainer, { behavior: 'smooth' })
const { shift, ctrl, meta } = useMagicKeys()

function toggleFileSelection(file: FileWithMetadata) {
  const modifier = shift?.value ? 'shift' : ctrl?.value || meta?.value ? 'ctrl' : undefined
  toggleSelection(file, modifier)
  scrollY.value = 0
}

async function remove(fileId: string) {
  await $trpc.file.delete.mutate({ fileId })
}

const showResetModal = ref<{ fileId: string } | null>(null)

function reset() {
  if (!showResetModal.value) {
    return
  }

  removeFileState(showResetModal.value.fileId)
  setupFileState(showResetModal.value.fileId)
  showResetModal.value = null
}

onMounted(async () => {
  const clerk = useClerk()
  const isClerkLoaded = computed(() => !!clerk.value)
  await until(isClerkLoaded).toBe(true)

  const orgId = Array.isArray(route.params.orgId) ? route.params.orgId[0] : route.params.orgId as string
  if (!orgId) {
    return
  }

  clearStorage()

  await clerk.value?.setActive({ organization: orgId })
  await load()
  connect(clerk.value?.organization?.id ?? orgId)
})
</script>

<template>
  <ModalConfirm
    v-model="showResetModal"
    title="Are you sure you want to revert the file?"
    description="This will discard all unsaved changes made to the file's metadata."
    :labels="{ confirm: 'Revert', cancel: 'Cancel' }"
    @confirm="reset()"
  />
  <UDashboardGroup class="Dashboard">
    <UDashboardSidebar class="Sidebar" :default-size="20">
      <template #header>
        <div class="flex flex-col w-full h-[var(--u-header-height)]">
          <WorkspaceUploadButton />
        </div>
      </template>

      <div v-if="!isLoading">
        <FileList
          v-if="Object.values(loadedFiles).length > 0"
          :files="loadedFiles"
          class="FileContainer"
          :class="{ DisableSelection: shift }"
          @select="toggleFileSelection"
          @remove="remove"
          @reset="fileId => showResetModal = { fileId }"
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
      </div>
      <div v-else>
        <USkeleton v-for="file in []" :key="file" class="w-full h-20 mb-2 rounded-lg" />
      </div>
    </UDashboardSidebar>
    <UDashboardPanel :ui="{ body: 'pr-0!' }" class="min-h-min!">
      <template #header>
        <UDashboardNavbar title="Edit Metadata">
          <template #right>
            <div class="flex items-center gap-2">
              <WorkspaceDownloadButton v-if="selectedIds.length > 0" />
              <WorkspaceSaveButton v-if="selectedIds.length > 0" />
            </div>
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <div ref="editorContainer" class="overflow-y-auto">
          <EditorContainer v-if="!isLoading" />
          <USkeleton v-else class="w-full h-full rounded-lg" />
        </div>
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
