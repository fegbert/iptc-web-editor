<script setup lang="ts">
const props = defineProps<{
  title: string
  original: string
  placeholder?: string
  required?: boolean
}>()

const value = defineModel<string>()

const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)
</script>

<template>
  <BaseField :title="title" :original="original" :has-changed="hasChanged" :required="required" @reset="value = original">
    <UTextarea
      v-model="value"
      :placeholder="placeholder"
      autoresize
      :maxrows="5"
      :color="hasChanged ? 'secondary' : undefined"
      :highlight="hasChanged"
    />
  </BaseField>
</template>
