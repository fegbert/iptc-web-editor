<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const props = defineProps<{
  fileId: string
  original?: string
}>()

const field = defineModel<IPTCFieldWithValue & { type: 'language' }>({ required: true })

const fileId = computed(() => props.fileId)
const hasChanged = useHasChanged(fileId, field)

const selectedLanguage = computed({
  get: () => languages.find(lang => lang.value === field.value.value),
  set: (newValue) => {
    field.value.value = newValue ? newValue.value : ''
  },
})
</script>

<template>
  <BaseField v-model="field" :has-changed="hasChanged" @reset="field.value = props.original ?? ''">
    <BaseSelect
      v-model="selectedLanguage"
      :options="languages"
      :has-changed="hasChanged"
      :placeholder="field.placeholder ?? 'Select a language'"
      virtualize
    >
      <template #leading="{ modelValue, ui }">
        <span v-if="modelValue?.value" class="size-5 text-default/75 text-center">
          {{ modelValue.value }}
        </span>
        <UIcon v-else name="i-lucide-languages" :class="ui.leadingIcon()" />
      </template>

      <template #label="{ modelValue }">
        {{ modelValue.label }}
      </template>

      <template #item-leading="{ item }">
        <span class="size-5 text-default/75 text-center">{{ item.value }}</span>
      </template>
    </BaseSelect>
  </BaseField>
</template>
