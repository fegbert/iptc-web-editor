<script setup lang="ts">
const props = defineProps<{
  title: string
  original: string
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
}>()

const value = defineModel<string>()

const rawValue = computed<number | undefined>({
  get() {
    if (!value.value || value.value === '') {
      return undefined
    }

    const num = Number(value.value)
    return Number.isNaN(num) ? undefined : num
  },
  set(val: number | undefined) {
    value.value = val !== undefined ? String(val) : ''
  },
})

const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)
</script>

<template>
  <BaseField :title="title" :required="required" :has-changed="hasChanged" @reset="value = original">
    <UInputNumber
      v-model="rawValue"
      :min="min"
      :max="max"
      :placeholder="placeholder"
      :color="hasChanged ? 'secondary' : undefined"
      :highlight="hasChanged"
      orientation="vertical"
      class="w-full"
    />
  </BaseField>
</template>
