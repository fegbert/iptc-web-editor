<script setup lang="ts">
import { objectAttributes, objectTypes } from '~/utils/iptc-iim/mapping'

const props = defineProps<{
  title: string
  original: string
  type: 'object-type' | 'object-attribute'
  required?: boolean
}>()

const value = defineModel<string>()

const objectData = computed(() => {
  return props.type === 'object-type' ? objectTypes : objectAttributes
})

const selectOptions = objectData.value.map(data => ({
  label: data.name,
  number: data.number,
  value: `${data.number}:${data.name}`,
}))

const rawValue = computed({
  get: () => selectOptions.find(option => option.value === value.value),
  set: (newValue) => {
    value.value = newValue?.value ?? ''
  },
})

const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)
</script>

<template>
  <BaseField v-model="value" :title="title" :required="required" :has-changed="hasChanged" @reset="value = original">
    <BaseSelect
      v-model="rawValue"
      :options="selectOptions"
      :has-changed="hasChanged"
      :placeholder="`Select an object ${type === 'object-type' ? 'type' : 'attribute'}`"
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
