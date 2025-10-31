<script setup lang="ts">
const props = defineProps<{
  title: string
  placeholder?: string
  icon?: string
  required?: boolean
  original: string
}>()

const value = defineModel<string>()

const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)
</script>

<template>
  <BaseField :title="title" :required="required" :has-changed="hasChanged" @reset="value = original">
    <UInput v-model="value" :color="hasChanged ? 'secondary' : undefined" :highlight="hasChanged" :placeholder="placeholder" :icon="icon" class="w-full" />
  </BaseField>
</template>
