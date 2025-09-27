<script setup lang="ts">
type FieldType = 'text'

const props = defineProps<{
  type: FieldType
  name: string
  placeholder?: string
}>()

const value = defineModel<string>()

const label = computed(() => {
  return props.name.charAt(0).toUpperCase() + props.name.slice(1)
})
</script>

<template>
  <UFormField :name="props.name" :label="label" class="w-full">
    <UInput v-model="value" :placeholder="placeholder" class="w-full" />
  </UFormField>
</template>
