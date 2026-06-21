<script setup lang="ts">
import type { TemplateListOutput } from '~/server/types'
import type { TemplateIdb } from '~/shared/types'
import { iptcIimFields } from '~/utils/iptc-iim/mapping'

export type UserTemplateItem = (TemplateIdb & { isLocal: true }) | (TemplateListOutput & { isLocal: false })

defineProps<{
  userTemplates: UserTemplateItem[]
  orgTemplates: TemplateListOutput[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'edit', template: UserTemplateItem): void
  (e: 'delete', template: UserTemplateItem): void
  (e: 'promote', template: TemplateIdb & { isLocal: true }): void
  (e: 'apply', template: UserTemplateItem): void
}>()

const { orgId, userId } = useAuth()
const collapsibleStates = ref<Record<string, boolean>>({})

const templateToDelete = ref<UserTemplateItem | null>(null)

function filledFieldCount(fields: UserTemplateItem['fields']) {
  return fields.filter(field => field.value).length
}

function isSharedWithOrg(template: TemplateListOutput) {
  return !!orgId.value && template.sharedWithOrgIds.includes(orgId.value)
}

function getFieldTitle(fieldId: string) {
  return iptcIimFields.find(field => field.key === fieldId)?.title || fieldId
}

function deleteTemplate() {
  if (!templateToDelete.value) {
    return
  }

  emit('delete', templateToDelete.value)
  templateToDelete.value = null
}
</script>

<template>
  <ModalConfirm
    v-model="templateToDelete"
    title="Delete Template?"
    description="Are you sure you want to delete this template? This action cannot be undone."
    :labels="{ confirm: 'Delete', cancel: 'Cancel' }"
    @confirm="deleteTemplate"
  />
  <div class="flex flex-col gap-6 py-2">
    <div class="flex flex-col gap-2">
      <p class="text-sm font-medium">
        Your Templates
      </p>
      <USkeleton v-if="isLoading" class="h-16 w-full" />
      <div v-else-if="userTemplates.length > 0" class="flex flex-col gap-2">
        <UCollapsible v-for="template in userTemplates" :key="template.id" :open="collapsibleStates[template.id]" class="flex flex-col gap-4 rounded-lg border border-default px-4 py-3" @update:open="collapsibleStates[template.id] = $event">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <UIcon name="i-lucide-chevron-down" class="transition-transform duration-200" :class="{ 'rotate-180': collapsibleStates[template.id] }" />
              <div class="flex flex-col gap-0.5 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-highlighted truncate">{{ template.title }}</span>
                  <UBadge v-if="template.isLocal" color="neutral" variant="subtle" size="sm">
                    Local
                  </UBadge>
                  <UBadge v-else-if="isSharedWithOrg(template)" color="success" variant="subtle" size="sm">
                    Shared with this Workspace
                  </UBadge>
                </div>
                <p v-if="template.description" class="text-xs text-muted truncate">
                  {{ template.description }}
                </p>
                <p class="text-xs text-muted">
                  {{ filledFieldCount(template.fields) }} field{{ filledFieldCount(template.fields) === 1 ? '' : 's' }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <UButton
                v-if="template.isLocal && !!userId"
                size="sm"
                variant="ghost"
                color="neutral"
                icon="i-lucide-cloud-upload"
                @click.stop="emit('promote', template)"
              >
                Promote
              </UButton>
              <ModalTemplateSharePopover v-if="!template.isLocal" :template="template" />
              <UButton icon="i-lucide-clipboard-paste" size="sm" variant="ghost" color="primary" @click.stop="emit('apply', template)">
                Apply
              </UButton>
              <USeparator orientation="vertical" class="h-8" />
              <UButton icon="i-lucide-edit" size="sm" variant="ghost" color="primary" @click.stop="emit('edit', template)" />
              <UButton size="sm" variant="ghost" color="error" icon="i-lucide-trash-2" @click.stop="templateToDelete = template" />
            </div>
          </div>

          <template #content>
            <USeparator />
            <div class="flex flex-col gap-3 pt-3">
              <div v-for="field in template.fields.filter(f => f.value)" :key="field.fieldId">
                <label class="flex items-center gap-4">
                  <span class="text-sm w-36 truncate">{{ getFieldTitle(field.fieldId) }}</span>
                  <UInput :value="field.value" disabled class="w-full" />
                </label>
              </div>
            </div>
          </template>
        </UCollapsible>
      </div>
      <UEmpty
        v-else
        class="px-4 py-6"
        size="sm"
        variant="outline"
        icon="i-lucide-book-open"
        title="No templates yet."
        :actions="[{ label: 'Create Template', onClick: () => emit('create'), icon: 'i-lucide-plus' }]"
      />
    </div>

    <template v-if="!!orgId">
      <USeparator />

      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium text-highlighted">
          Org Templates
        </p>
        <USkeleton v-if="isLoading" class="h-16 w-full" />
        <div v-else-if="orgTemplates.length > 0" class="flex flex-col gap-2">
          <div v-for="template in orgTemplates" :key="template.id" class="flex items-center justify-between gap-4 rounded-lg border border-default px-4 py-3">
            <div class="flex flex-col gap-0.5 min-w-0">
              <span class="text-sm font-medium text-highlighted truncate">{{ template.title }}</span>
              <p v-if="template.description" class="text-xs text-muted truncate">
                {{ template.description }}
              </p>
              <p class="text-xs text-muted">
                {{ filledFieldCount(template.fields) }} field{{ filledFieldCount(template.fields) === 1 ? '' : 's' }}
              </p>
            </div>
            <UButton icon="i-lucide-clipboard-paste" size="sm" variant="ghost" color="primary" @click="emit('apply', { ...template, isLocal: false })">
              Apply
            </UButton>
          </div>
        </div>
        <UEmpty
          v-else
          class="px-4 py-6"
          size="xs"
          variant="outline"
          icon="i-lucide-book-open"
          title="No templates shared from your org members yet."
        />
      </div>
    </template>
  </div>
</template>
