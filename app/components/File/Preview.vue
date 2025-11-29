<script setup lang="ts">
import type { FileWithMetadata } from '~/shared/types'

const props = withDefaults(defineProps<{
  image: FileWithMetadata
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

const file = computed(() => props.image.file)
const fileUrl = URL.createObjectURL(file.value)
const fileSize = (file.value.size / 1024).toFixed(2)
const altText = `${file.value.name} - ${fileSize} KB`

const { isSelected } = useFileSelection()
const { fileChanges } = useFileState()

const hasChanged = computed(() => fileChanges(props.image.id) > 0)
</script>

<template>
  <div
    class="flex relative items-center gap-4 border border-accented rounded-lg p-2 hover:bg-accented/20"
    :class="{
      'border-primary bg-accented/20': isSelected(image.id),
      'border-secondary': hasChanged && !isSelected(image.id),
      'bg-secondary/10 hover:bg-secondary/20': hasChanged,
    }"
    @click="emit('select', image)"
  >
    <NuxtImg :src="fileUrl" :alt="altText" :width="width" :height="height" />
    <div v-if="showDetails" class="flex flex-col max-w-[60%]">
      <UTooltip :text="file.name">
        <span class="font-semibold truncate text-sm">{{ file.name }}</span>
      </UTooltip>
      <UTooltip :text="`${fileSize} KB`">
        <span class="text-default/50 text-sm truncate">{{ fileSize }} KB</span>
      </UTooltip>
      <UTooltip :text="formatDate(file.lastModified).value">
        <span class="text-default/50 text-sm truncate">{{ formatDate(file.lastModified).value }}</span>
      </UTooltip>
    </div>
    <div class="absolute top-0 right-0 flex items-center mr-1 mt-1 gap-1">
      <UButton v-if="hasChanged" color="secondary" size="sm" icon="i-lucide-timer-reset" variant="subtle" @click.stop="emit('reset', image.id)" />
      <UButton color="error" variant="subtle" size="sm" icon="i-lucide-x" @click.stop="emit('remove', image.id)" />
    </div>
  </div>
</template>
