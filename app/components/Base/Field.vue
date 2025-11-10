<script setup lang="ts">
import type { CharacterTypes } from '~/utils/iptc-iim/types'

const props = defineProps<{
  title: string
  hasChanged: boolean
  required?: boolean
  allowedCharacters?: CharacterTypes[]
}>()

const emit = defineEmits<{
  (e: 'reset'): void
}>()

const value = defineModel<string>()

const isValueValid = computed(() => {
  if (!props.allowedCharacters || !value.value) {
    return true
  }

  return isValid(value.value, props.allowedCharacters)
})

const errorMessage = computed(() => {
  if (isValueValid.value) {
    return undefined
  }

  return `Only the following characters are allowed: ${props.allowedCharacters?.join(', ')}`
})
</script>

<template>
  <UFormField :name="title" :required="required" :error="errorMessage" class="FormField w-full">
    <template #label>
      <div class="flex items-center w-full h-7 gap-1">
        <span>{{ title }}</span>
        <UButton v-if="hasChanged" size="sm" color="secondary" variant="link" icon="i-lucide-timer-reset" @click="emit('reset')" />
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
