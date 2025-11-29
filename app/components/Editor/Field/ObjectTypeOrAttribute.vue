<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'
import { objectAttributes, objectTypes } from '~/utils/iptc-iim/mapping'

const props = defineProps<{
  fileId: string
  original?: string
}>()

const field = defineModel<IPTCFieldWithValue & { type: 'object-type' | 'object-attribute' }>({ required: true })

const objectData = computed(() => {
  return field.value.type === 'object-type' ? objectTypes : objectAttributes
})

const selectOptions = objectData.value.map(data => ({
  label: data.name,
  number: data.number,
  value: `${data.number}:${data.name}`,
}))

const rawValue = computed({
  get: () => selectOptions.find(option => option.value === field.value.value),
  set: (newValue) => {
    field.value.value = newValue?.value ?? ''
  },
})

const hasChanged = useHasChanged(props.fileId, field)
</script>

<template>
  <BaseField v-model="field" :has-changed="hasChanged" @reset="field.value = original ?? ''">
    <BaseSelect
      v-model="rawValue"
      :options="selectOptions"
      :has-changed="hasChanged"
      :icon="field.icon"
      :placeholder="`Select an object ${field.type === 'object-type' ? 'type' : 'attribute'}`"
    >
      <template #label>
        <div v-if="rawValue?.value">
          <span class="text-sm text-default/75">{{ `${rawValue.number} ` }}</span>
          <span> {{ rawValue.label }}</span>
        </div>
      </template>
      <template #item-leading="{ item }">
        <span class="text-sm text-default/75">{{ item.number }}</span>
      </template>
    </BaseSelect>
  </BaseField>
</template>
