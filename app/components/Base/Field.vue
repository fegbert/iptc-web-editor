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

const multiFileCtx = inject<{
  isMixed: (key: string) => boolean
  getMixedValues: (key: string) => { fileId: string, fileName: string, value: string }[]
} | null>('editorMultiFile', null)

const isMixed = computed(() => multiFileCtx?.isMixed(field.value.key) ?? false)
const mixedValues = computed(() => multiFileCtx?.getMixedValues(field.value.key) ?? [])
</script>

<template>
  <UFormField :name="title ?? formattedTitle" :error="errorMessage" class="FormField w-full">
    <template #label>
      <div class="flex items-center w-full h-7 gap-1">
        <span>{{ title ?? formattedTitle }}</span>
        <UButton v-if="hasChanged" size="sm" color="secondary" variant="link" icon="i-lucide-timer-reset" @click.prevent="emit('reset')" />
        <UPopover v-if="isMixed" mode="hover" :content="{ side: 'top' }" class="max-w-sm">
          <div class="pt-1">
            <UIcon name="i-lucide-layers" class="w-3.5 h-3.5 text-warning" />
          </div>
          <template #content>
            <div class="flex flex-col min-w-48 py-3">
              <p class="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-default/50">
                Existing values
              </p>
              <div v-for="(mixed, index) in mixedValues" :key="mixed.fileId" :class="index % 2 === 0 ? 'bg-accented/30' : ''">
                <div v-if="mixed.value" class="flex w-full justify-between px-3 py-1.5 max-w-xs">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs text-default/50 truncate">{{ mixed.fileName }}</span>
                    <span class="text-sm text-wrap">{{ mixed.value || '-' }}</span>
                  </div>
                  <UButton v-if="mixed.value" size="xs" class="h-6" variant="ghost" icon="lucide:circle-plus" @click="field.value = mixed.value" />
                </div>
              </div>
            </div>
          </template>
        </UPopover>
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
