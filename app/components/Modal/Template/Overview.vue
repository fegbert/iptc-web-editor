<script setup lang="ts">
import type { Prisma } from '~/prisma/generated/client'

const emit = defineEmits<{
  (e: 'close'): void
}>()
const open = defineModel<boolean>({ required: true })

const { userId, orgId } = useAuth()
const { templates: localTemplates, loadTemplatesFromIndexedDB } = useTemplate()

const isUserInOrg = computed(() => !!orgId.value)

const { template: queryTemplate } = useQuery()
const { data: remoteTemplates, isLoading } = queryTemplate.list({ enabled: isUserInOrg })

const { template: mutationTemplate } = useMutations()
const { setSharing } = mutationTemplate()

type ModalView = 'list' | 'create'

const view = ref<ModalView>('list')

const userTemplates = computed(() => [
  ...localTemplates.value.map(template => ({ ...template, isLocal: true as const })),
  ...remoteTemplates.value
    ?.filter(template => template.createdBy === userId.value)
    .map(template => ({ ...template, isLocal: false as const })) ?? [],
])

const orgTemplates = computed(() => remoteTemplates.value?.filter(t => t.createdBy !== userId.value) ?? [])

function handleToggleSharing(template: Prisma.TemplateGetPayload<{ select: { id: true, sharedWithOrgIds: true } }>) {
  if (!orgId.value) {
    return
  }

  const isShared = template.sharedWithOrgIds.includes(orgId.value)
  setSharing.mutate({
    id: template.id,
    shared: !isShared,
  })
}

async function handleSaved() {
  view.value = 'list'
  await loadTemplatesFromIndexedDB()
}

watch(open, async (isOpen) => {
  if (!isOpen) {
    view.value = 'list'
    return
  }

  await loadTemplatesFromIndexedDB()
}, { immediate: true })

function handleClose() {
  if (view.value === 'create') {
    view.value = 'list'
  }
  else {
    emit('close')
  }
}
</script>

<template>
  <UModal
    :open="Boolean(open)"
    :title="view === 'create' ? 'Create Template' : 'Templates'"
    :description="view === 'create'
      ? 'Define field values to reuse across files.'
      : 'Apply predefined metadata values to the selected file(s).'
    "
    :ui="{
      content: 'min-w-[40vw]',
    }"
    @update:open="(value) => !value ? handleClose() : undefined"
  >
    <template #header>
      <div class="flex justify-between w-full items-center">
        <div>
          <p class="font-semibold text-highlighted">
            {{ view === 'create' ? 'Create Template' : 'Templates' }}
          </p>
          <p v-if="view === 'create'" class="text-sm text-muted">
            Define field values to reuse across files.
          </p>
          <p v-else class="text-sm text-muted">
            Apply predefined metadata values to the selected file(s).
          </p>
        </div>
        <div>
          <div v-if="view === 'list'" class="flex items-center gap-2">
            <UButton variant="soft" size="sm" color="primary" icon="i-lucide-plus" @click="view = 'create'">
              Create
            </UButton>
            <UButton variant="ghost" color="neutral" icon="i-lucide-x" @click="emit('close')" />
          </div>
          <UButton v-else variant="ghost" color="neutral" icon="i-lucide-arrow-left" @click="view = 'list'" />
        </div>
      </div>
    </template>

    <template #close />

    <template #body>
      <ModalTemplateViewCreate v-if="view === 'create'" @saved="handleSaved" />
      <ModalTemplateViewList
        v-else
        :user-templates="userTemplates"
        :org-templates="orgTemplates"
        :is-loading="isLoading"
        @create="view = 'create'"
        @toggle-sharing="handleToggleSharing"
        @apply="() => {}"
      />
    </template>
  </UModal>
</template>
