<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  original: string
  options: { label: string, value: string }[]
  placeholder?: string
  required?: boolean
}>(), {
  placeholder: 'Select an option',
})

const value = defineModel<string>()

const rawValue = computed({
  get: () => props.options.find(option => option.value === value.value),
  set: (newValue) => {
    value.value = newValue?.value ?? ''
  },
})

const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)
</script>

<template>
  <BaseField v-model="value" :title="title" :required="required" :has-changed="hasChanged" @reset="value = original">
    <BaseSelect v-model="rawValue" :options="options" :placeholder="placeholder" :has-changed="hasChanged">
      <template #label>
        <span>{{ rawValue?.label }}</span>
      </template>
    </BaseSelect>
  </BaseField>
</template>
