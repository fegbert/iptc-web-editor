<script setup lang="ts">
const props = defineProps<{
  title: string
  placeholder?: string
  icon?: string
  required?: boolean
}>()

const value = defineModel<string>()

const formattedTitle = useFieldTitle(props.title)
</script>

<template>
  <UFormField :name="props.title" :label="formattedTitle" :required="required" class="w-full">
    <UInput v-model="value" :placeholder="placeholder" :icon="icon" class="w-full" />
  </UFormField>
</template>
