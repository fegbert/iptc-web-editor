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

const { removeFile, toggleSelection } = useFiles()

const file = computed(() => props.image.file)
const fileUrl = URL.createObjectURL(file.value)
const fileSize = (file.value.size / 1024).toFixed(2)
const altText = `${file.value.name} - ${fileSize} KB`
</script>

<template>
  <div class="flex relative items-center gap-4 border border-accented rounded-lg p-2 hover:bg-accented/20" :class="{ 'border-primary bg-accented/20': image.isSelected }" @click="toggleSelection(image)">
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
    <UButton color="error" variant="ghost" icon="i-lucide-circle-x" class="absolute top-0 right-0 mt-1 mr-1" @click="removeFile(file)" />
  </div>
</template>
