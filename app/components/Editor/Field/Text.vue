<script setup lang="ts">
const props = defineProps<{
  title: string
  placeholder?: string
  icon?: string
  required?: boolean
}>()

const value = defineModel<string>()

const formattedTitle = computed(() => {
  return props.title.charAt(0).toUpperCase() + props.title.slice(1)
})
</script>

<template>
  <UFormField :name="props.title" :label="formattedTitle" :required="required" class="w-full">
    <UInput v-model="value" :placeholder="placeholder" :icon="icon" class="w-full" />
  </UFormField>
</template>
