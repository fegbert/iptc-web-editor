<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

defineProps<{
  hasChanged: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'reset'): void
}>()

const field = defineModel<IPTCFieldWithValue>({ required: true })

const isValueValid = computed(() => {
  if (!('allowedCharacterTypes' in field.value) || !field.value.allowedCharacterTypes || !field.value.value) {
    return true
  }

  return isValid(field.value.value, field.value.allowedCharacterTypes)
})

const errorMessage = computed(() => {
  if (isValueValid.value || !('allowedCharacterTypes' in field.value)) {
    return undefined
  }

  return `Only the following characters are allowed: ${field.value.allowedCharacterTypes?.join(', ')}`
})

const formattedTitle = computed(() => {
  return field.value.title.charAt(0).toUpperCase() + field.value.title.slice(1)
})
</script>

<template>
  <UFormField :name="title ?? formattedTitle" :error="errorMessage" class="FormField w-full">
    <template #label>
      <div class="flex items-center w-full h-7 gap-1">
        <span>{{ title ?? formattedTitle }}</span>
        <UButton v-if="hasChanged" size="sm" color="secondary" variant="link" icon="i-lucide-timer-reset" @click.prevent="emit('reset')" />
      </div>
    </template>
    <slot />
  </UFormField>
</template>

<style scoped>
.FormField :deep(label) {
  width: 100%;
}
</style>
