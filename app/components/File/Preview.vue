<script setup lang="ts">
import type { FileWithMetadata } from '~/shared/types'

const props = withDefaults(defineProps<{
  file: FileWithMetadata
  width?: number
  height?: number
  showDetails?: boolean
}>(), {
  width: 200,
  height: 200,
  showDetails: false,
})

const emit = defineEmits<{
  (e: 'select', file: FileWithMetadata): void
  (e: 'remove', fileId: string): void
  (e: 'reset', fileId: string): void
}>()

const fileData = computed(() => props.file.data)
const fileUrl = computedAsync(async () => props.file.previewUrl ?? await loadImageForPreview(props.file.buffer))
const fileSize = (fileData.value.size / 1024).toFixed(2)
const altText = `${fileData.value.name} - ${fileSize} KB`

const canDelete = computed(() => {
  const { orgRole, userId, orgId } = useAuth()
  return orgId.value ? orgRole.value === 'org:admin' || props.file.createdBy === userId.value : true
})

const { isSelected } = useFileSelection()
const { fileChanges } = useFileState()

const hasChanged = computed(() => fileChanges(props.file.id) > 0)

const { hasPendingProposal } = useProposal()
const isPending = computed(() => hasPendingProposal(props.file.id))
</script>

<template>
  <div
    class="flex relative items-center gap-4 border border-accented rounded-lg p-2 hover:bg-accented/20"
    :class="{
      'border-primary bg-accented/20': isSelected(file.id),
      'border-secondary': hasChanged && !isSelected(file.id),
      'bg-secondary/10 hover:bg-secondary/20': hasChanged,
      'border-warning': isPending && !hasChanged && !isSelected(file.id),
      'bg-warning/10 hover:bg-warning/20': isPending && !hasChanged,
    }"
    @click="emit('select', file)"
  >
    <NuxtImg v-if="fileUrl" :src="fileUrl" :alt="altText" :width="width" :height="height" />
    <div v-if="showDetails" class="flex flex-col max-w-[60%]">
      <UTooltip :text="fileData.name">
        <span class="font-semibold truncate text-sm">{{ fileData.name }}</span>
      </UTooltip>
      <UTooltip :text="`${fileSize} KB`">
        <span class="text-default/50 text-sm truncate">{{ fileSize }} KB</span>
      </UTooltip>
      <UTooltip :text="formatDate(fileData.lastModified).value">
        <span class="text-default/50 text-sm truncate">{{ formatDate(fileData.lastModified).value }}</span>
      </UTooltip>
    </div>
    <div class="absolute top-0 right-0 flex items-center mr-1 mt-1 gap-1">
      <UIcon v-if="isPending" name="i-lucide-clock" size="sm" class="w-3.5 h-3.5 text-warning mr-1" />
      <UButton v-if="hasChanged" color="secondary" size="sm" icon="i-lucide-timer-reset" variant="subtle" @click.stop="emit('reset', file.id)" />
      <UButton v-if="canDelete" color="error" variant="subtle" size="sm" icon="i-lucide-x" @click.stop="emit('remove', file.id)" />
    </div>
  </div>
</template>
