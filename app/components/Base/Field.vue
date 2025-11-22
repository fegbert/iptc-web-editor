<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const props = defineProps<{
  hasChanged: boolean
  title?: string
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'reset'): void
}>()

const field = defineModel<IPTCFieldWithValue>({ required: true })

const isValueValid = computed(() => {
  if (!field.value.allowedCharacterTypes || !field.value.value) {
    return true
  }

  return isValid(field.value.value, field.value.allowedCharacterTypes)
})

const errorMessage = computed(() => {
  if (!isValueValid.value) {
    return `Only the following characters are allowed: ${field.value.allowedCharacterTypes?.join(', ')}`
  }

  if (props.required && !field.value.value) {
    return 'This field is required'
  }

  return undefined
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
    <slot name="default" :error="errorMessage" />

    <template #error="{ error }">
      <div v-if="error" class="text-xs text-negative mt-1">
        {{ error }}
      </div>
    </template>
  </UFormField>
</template>

<style scoped>
.FormField :deep(label) {
  width: 100%;
}
</style>
