<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  options: { label: string, value: string }[]
  placeholder?: string
  icon?: string
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

const formattedTitle = useFieldTitle(props.title)
</script>

<template>
  <UFormField :name="title" :label="formattedTitle" :required="required" class="w-full">
    <BaseSelect v-model="rawValue" :options="options" :placeholder="placeholder">
      <template #label>
        <span>{{ rawValue?.label }}</span>
      </template>
    </BaseSelect>
  </UFormField>
</template>
