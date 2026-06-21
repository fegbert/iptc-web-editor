<script setup lang="ts">
import type { UserTemplateItem } from './View/List.vue'

const emit = defineEmits<{
  (e: 'close'): void
}>()
const open = defineModel<boolean>({ required: true })

const { userId } = useAuth()
const { templates: localTemplates, loadTemplatesFromIndexedDB, deleteTemplate: deleteLocalTemplate } = useTemplate()
const { updateFileData } = useFileState()
const { selectedIds } = useFileSelection()
const notification = useToast()

const isUserLoggedIn = computed(() => !!userId.value)

const { template: queryTemplate } = useQuery()
const { data: remoteTemplates, isLoading } = queryTemplate.list({ enabled: isUserLoggedIn })

const { template: mutationTemplate } = useMutations()
const { deleteTemplate: deleteRemoteTemplate, upsert } = mutationTemplate()

type ModalView = 'list' | 'create' | 'edit'

const view = ref<ModalView>('list')
const editingTemplate = ref<UserTemplateItem | null>(null)

const userTemplates = computed(() => [
  ...localTemplates.value.map(template => ({ ...template, isLocal: true as const })),
  ...remoteTemplates.value
    ?.filter(template => template.createdBy === userId.value)
    .map(template => ({ ...template, isLocal: false as const })) ?? [],
])

const orgTemplates = computed(() => remoteTemplates.value?.filter(t => t.createdBy !== userId.value) ?? [])

function handleEdit(template: UserTemplateItem) {
  editingTemplate.value = template
  view.value = 'edit'
}

async function handleDelete(template: UserTemplateItem) {
  if (template.isLocal) {
    await deleteLocalTemplate(template.id)
    notification.add({
      color: 'success',
      title: 'Template Deleted',
      description: 'The template has been deleted from your local storage.',
      duration: 3000,
    })
  }
  else {
    deleteRemoteTemplate.mutate({ id: template.id })
  }
}

async function handlePromote(template: UserTemplateItem & { isLocal: true }) {
  await upsert.mutateAsync({
    title: template.title,
    description: template.description ?? undefined,
    fields: template.fields.map(field => ({ fieldId: field.fieldId, value: field.value ?? undefined })),
  })

  if (!upsert.isSuccess.value) {
    return
  }

  await deleteLocalTemplate(template.id)
}

function handleApply(template: { fields: UserTemplateItem['fields'] }) {
  if (selectedIds.value.length === 0) {
    notification.add({
      title: 'No Files Selected',
      description: 'Please select one or more files to apply the template to.',
      color: 'warning',
      duration: 3000,
    })
    return
  }

  template.fields
    .filter(field => field.value)
    .forEach(({ fieldId, value }) => {
      selectedIds.value.forEach(fileId => updateFileData(fileId, fieldId, value!))
    })

  notification.add({
    title: 'Template applied!',
    description: `The template has been applied to ${selectedIds.value.length} file${selectedIds.value.length !== 1 ? 's' : ''}.`,
    color: 'success',
    duration: 3000,
  })

  emit('close')
}

async function handleSaved() {
  view.value = 'list'
  editingTemplate.value = null
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
  if (view.value === 'create' || view.value === 'edit') {
    view.value = 'list'
    editingTemplate.value = null
  }
  else {
    emit('close')
  }
}
</script>

<template>
  <UModal
    :open="Boolean(open)"
    :title="view === 'edit' ? 'Edit Template ' : view === 'create' ? 'Create Template' : 'Templates'"
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
          <p v-else-if="view === 'edit'" class="text-sm text-muted">
            Update the template's field values.
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
          <UButton v-else variant="ghost" color="neutral" icon="i-lucide-arrow-left" @click="handleClose" />
        </div>
      </div>
    </template>

    <template #close />

    <template #body>
      <ModalTemplateViewCreateOrEdit
        v-if="view === 'create' || view === 'edit'"
        :template="editingTemplate ?? undefined"
        @saved="handleSaved"
      />
      <ModalTemplateViewList
        v-else
        :user-templates="userTemplates"
        :org-templates="orgTemplates"
        :is-loading="isLoading"
        @create="view = 'create'"
        @edit="handleEdit"
        @delete="handleDelete"
        @promote="handlePromote"
        @apply="handleApply"
      />
    </template>
  </UModal>
</template>
