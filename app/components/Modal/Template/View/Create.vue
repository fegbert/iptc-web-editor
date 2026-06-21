<script setup lang="ts">
import { categories } from '~/utils/iptc-iim/categories'
import { iptcIimFields } from '~/utils/iptc-iim/mapping'

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const { createTemplate } = useTemplate()
const { selectedIds } = useFileSelection()
const { getFileState } = useFileState()
const notification = useToast()

const { orgId } = useAuth()

const { template: mutationTemplate } = useMutations()
const { upsert } = mutationTemplate()

const isSavingRemote = computed(() => upsert.isPending.value)

const title = ref('')
const description = ref('')
const search = ref('')

const fieldValues = ref<Record<string, string>>({})

const groupedFields = computed(() => categories.map(category => ({
  title: category.title,
  fields: category.rows
    .flat()
    .map(({ key }) => iptcIimFields.find(field => field.key === key))
    .filter((field): field is NonNullable<typeof field> => !!field && field.type !== 'extra'),
})).filter(category => category.fields.length > 0))

const filteredGroups = computed(() => {
  const searchTerm = search.value.toLowerCase()
  if (!searchTerm) {
    return groupedFields.value
  }

  return groupedFields.value
    .map(category => ({
      ...category,
      fields: category.fields.filter(field => field.title.toLowerCase().includes(searchTerm) || field.key.includes(searchTerm)),
    }))
    .filter(category => category.fields.length > 0)
})

const filledCount = computed(() => Object.values(fieldValues.value).filter(value => value).length)

function importCurrentValues() {
  const ids = selectedIds.value
  if (ids.length === 0) {
    return
  }

  if (ids.length > 1) {
    notification.add({
      title: 'Import not supported for multiple files',
      description: 'Please select only one file to import its current metadata values.',
      color: 'error',
      duration: 3000,
    })
    return
  }

  getFileState(ids[0]!).forEach((field) => {
    if (!field.value) {
      return
    }

    fieldValues.value[field.key] = field.value
  })

  notification.add({
    title: 'Values imported',
    description: 'Current metadata values from the selected file have been imported into the template.',
    color: 'success',
    duration: 3500,
  })
}

async function saveLocal() {
  if (!title.value.trim()) {
    return
  }
  await createTemplate({
    title: title.value.trim(),
    description: description.value.trim() ?? null,
    fields: Object.entries(fieldValues.value)
      .filter(([, value]) => value)
      .map(([key, value]) => ({ fieldId: key, value })),
  })

  emit('saved')
}

async function saveToWorkspace() {
  if (!title.value.trim()) {
    return
  }

  upsert.mutate({
    title: title.value.trim(),
    description: description.value.trim() ?? null,
    fields: Object.entries(fieldValues.value)
      .filter(([, value]) => value)
      .map(([key, value]) => ({ fieldId: key, value })),
  })

  emit('saved')
}

function isTruncated(element: HTMLElement): boolean {
  return element.scrollWidth > element.offsetWidth
}
</script>

<template>
  <div class="flex flex-col gap-4 py-2">
    <div class="flex flex-col gap-4">
      <UInput v-model="title" placeholder="" :ui="{ base: 'peer' }">
        <label class="FloatingLabel">
          <span class="inline-flex bg-default px-1">Template Title</span>
        </label>
      </UInput>
      <UInput v-model="description" placeholder="" :ui="{ base: 'peer' }">
        <label class="FloatingLabel">
          <span class="inline-flex bg-default px-1">Description (optional)</span>
        </label>
      </UInput>
    </div>

    <USeparator />

    <div class="flex items-center gap-2">
      <UButton variant="subtle" color="neutral" icon="i-lucide-clipboard-copy" :disabled="selectedIds.length !== 1" class="w-1/2 justify-center" @click="importCurrentValues">
        Import from selected file
      </UButton>
      <UInput v-model="search" placeholder="Search fields..." class="w-1/2" icon="i-lucide-search" />
    </div>

    <div class="overflow-y-auto max-h-[360px] flex flex-col gap-5 -mx-1 px-1">
      <div v-for="group in filteredGroups" :key="group.title">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
          {{ group.title }}
        </p>
        <div class="flex flex-col gap-2">
          <div v-for="field in group.fields" :key="field.key" class="flex items-center gap-3">
            <span class="text-sm w-40 shrink-0 truncate" :title="field.title">{{ field.title }}</span>
            <UInput
              v-model="fieldValues[field.key]"
              :placeholder="field.placeholder"
              :highlight="!!fieldValues[field.key]"
              variant="outline"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <UEmpty
        v-if="filteredGroups.length === 0"
        class="w-full my-1"
        size="sm"
        variant="outline"
        icon="i-lucide-search-x"
        title="No fields match your search."
      />
    </div>

    <USeparator />

    <div class="flex items-center justify-between pt-1">
      <p v-if="orgId" class="text-xs text-muted">
        Local templates are stored in your browser and only available to you. Saving to workspace allows you to access the template across devices and share it with your organization.
      </p>
      <div class="flex w-full gap-2 shrink-0">
        <UButton class="w-full justify-center" variant="soft" color="neutral" :disabled="!title.trim() || isSavingRemote || filledCount === 0" @click="saveLocal">
          Save locally
        </UButton>
        <UButton v-if="orgId" color="primary" :disabled="!title.trim() || filledCount === 0" :loading="isSavingRemote" @click="saveToWorkspace">
          Save to workspace
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.FloatingLabel {
  @apply pointer-events-none absolute left-0 -top-2.5 text-xs font-medium px-1.5 transition-all peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-dimmed peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal
}
</style>
