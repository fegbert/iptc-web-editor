<script setup lang="ts">
import type { UserTemplateItem } from './List.vue'
import type { IPTCField } from '~/utils/iptc-iim/types.js'
import { categories } from '~/utils/iptc-iim/categories'
import { iptcIimFields } from '~/utils/iptc-iim/mapping'

const props = defineProps<{
  template?: UserTemplateItem
}>()

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const { createTemplate, updateTemplate } = useTemplate()
const { selectedIds } = useFileSelection()
const { getFileState } = useFileState()
const notification = useToast()

const { userId } = useAuth()

const { template: mutationTemplate } = useMutations()
const { upsert } = mutationTemplate()

const isEditMode = computed(() => !!props.template)
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

const fieldErrors = computed(() => {
  const errors: Record<string, string> = {}

  for (const [key, value] of Object.entries(fieldValues.value)) {
    if (!value) continue

    const field = iptcIimFields.find(field => field.key === key)
    if (!field?.allowedCharacterTypes?.length) continue
    if (!isValid(value, field.allowedCharacterTypes)) {
      errors[key] = `Only the following characters are allowed: ${field.allowedCharacterTypes.join(', ')}`
    }
  }

  return errors
})

const hasErrors = computed(() => Object.keys(fieldErrors.value).length > 0)

const isSavingDisabled = computed(() => !title.value.trim() || filledCount.value === 0 || hasErrors.value)

function digits(num?: number) {
  return (num ?? 0).toString().length
}

function getCharacterLimits(field: IPTCField) {
  const currentValue = fieldValues.value[field.key] ?? ''

  const limits = typeof field.octets === 'number' ? { max: field.octets } : field.octets
  const characterCountText = limits ? `${currentValue.length}/${limits.max}` : undefined
  const characterCountWidth = limits ? `${digits(currentValue.length) + 1 + digits(limits.max)}ch` : undefined

  return { limits, characterCountText, characterCountWidth }
}

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
    if (!field.value || field.key === '2:65' || field.key === '2:70') {
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

watch(() => props.template, (template) => {
  if (template) {
    title.value = template.title
    description.value = template.description ?? ''
    fieldValues.value = Object.fromEntries(
      template.fields.filter(field => field.value).map(field => [field.fieldId, field.value!]),
    )
  }
  else {
    title.value = ''
    description.value = ''
    fieldValues.value = {}
  }
}, { immediate: true })

async function saveLocal() {
  if (!title.value.trim()) {
    return
  }

  if (isEditMode.value && props.template!.isLocal) {
    await updateTemplate({
      id: props.template!.id,
      title: title.value.trim(),
      description: description.value.trim() ?? null,
      fields: Object.entries(fieldValues.value)
        .filter(([, value]) => value)
        .map(([key, value]) => ({ fieldId: key, value })),
    })
  }
  else {
    await createTemplate({
      title: title.value.trim(),
      description: description.value.trim() ?? null,
      fields: Object.entries(fieldValues.value)
        .filter(([, value]) => value)
        .map(([key, value]) => ({ fieldId: key, value })),
    })
  }

  emit('saved')
}

async function saveToServer() {
  if (!title.value.trim()) {
    return
  }

  await upsert.mutateAsync({
    title: title.value.trim(),
    description: description.value.trim() ?? null,
    fields: Object.entries(fieldValues.value)
      .filter(([, value]) => value)
      .map(([key, value]) => ({ fieldId: key, value })),
  })

  if (upsert.isSuccess.value) {
    emit('saved')
  }
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
            <div class="flex flex-col gap-1 w-full">
              <UInput
                v-model="fieldValues[field.key]"
                :placeholder="field.placeholder"
                :highlight="!!fieldValues[field.key]"
                :maxlength="getCharacterLimits(field).limits?.max"
                :color="fieldErrors[field.key] ? 'error' : undefined"
                :ui="{ trailing: 'pointer-events-none' }"
                :style="{ paddingRight: getCharacterLimits(field).characterCountWidth }"
                variant="outline"
                class="w-full"
              >
                <template v-if="getCharacterLimits(field).limits !== undefined" #trailing>
                  <div
                    class="text-xs text-muted tabular-nums min-w-0"
                    :style="{ width: getCharacterLimits(field).characterCountWidth, textAlign: 'right' }"
                    aria-live="polite"
                    role="status"
                  >
                    {{ getCharacterLimits(field).characterCountText }}
                  </div>
                </template>
              </UInput>
              <p v-if="fieldErrors[field.key]" class="text-xs text-error">
                {{ fieldErrors[field.key] }}
              </p>
            </div>
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

    <template v-if="isEditMode">
      <UButton
        color="primary"
        class="justify-center"
        icon="i-lucide-save"
        :disabled="!title.trim() || filledCount === 0"
        :loading="isSavingRemote"
        @click="props.template!.isLocal ? saveLocal() : saveToServer()"
      >
        Save changes
      </UButton>
    </template>
    <template v-else>
      <div class="flex flex-col gap-2">
        <div class="flex w-full gap-2">
          <UButton icon="i-lucide-save" class="w-full justify-center" variant="soft" color="neutral" :disabled="isSavingRemote || isSavingDisabled" @click="saveLocal">
            Save locally
          </UButton>
          <UButton v-if="userId" icon="i-lucide-cloud-upload" class="w-full justify-center" color="primary" :disabled="isSavingDisabled" :loading="isSavingRemote" @click="saveToServer">
            Save to Server
          </UButton>
        </div>
        <p v-if="userId" class="text-xs text-muted">
          Local templates are stored in your browser and only available to you. Saving to the server allows you to access the template across devices and share it with your organization.
          Local templates may also be promoted to server templates at a later time.
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.FloatingLabel {
  @apply pointer-events-none absolute left-0 -top-2.5 text-xs font-medium px-1.5 transition-all peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-dimmed peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal
}
</style>
