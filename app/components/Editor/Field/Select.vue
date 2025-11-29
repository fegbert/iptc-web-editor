<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const props = defineProps<{
  fileId: string
  original?: string
}>()

const field = defineModel<IPTCFieldWithValue & { type: 'select' }>({ required: true })

const rawValue = computed({
  get: () => field.value.options.find(option => option.value === field.value.value),
  set: (newValue) => {
    field.value.value = newValue?.value ?? ''
  },
})

const hasChanged = useHasChanged(props.fileId, field)
</script>

<template>
  <BaseField v-model="field" :has-changed="hasChanged" @reset="field.value = original ?? ''">
    <BaseSelect v-model="rawValue" :options="field.options" :placeholder="field.placeholder ?? 'Select an option'" :has-changed="hasChanged" :icon="field.icon">
      <template #label>
        <span>{{ rawValue?.label }}</span>
      </template>
    </BaseSelect>
  </BaseField>
</template>
