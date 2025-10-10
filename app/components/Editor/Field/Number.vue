<script setup lang="ts">
const props = defineProps<{
  title: string
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
}>()

const value = defineModel<number>()

const formattedTitle = computed(() => {
  return props.title.charAt(0).toUpperCase() + props.title.slice(1)
})
</script>

<template>
  <UFormField :name="props.title" :label="formattedTitle" :required="required" class="w-full">
    <UInputNumber v-model="value" :placeholder="placeholder" orientation="vertical" class="w-full" />
  </UFormField>
</template>
