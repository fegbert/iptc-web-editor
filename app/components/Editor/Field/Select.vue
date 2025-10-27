<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui'

const props = defineProps<{
  title: string
  options: SelectMenuItem[]
  placeholder?: string
  icon?: string
  required?: boolean
}>()

const value = defineModel<string>()

const formattedTitle = useFieldTitle(props.title)
</script>

<template>
  <UFormField :name="props.title" :label="formattedTitle" :required="required" class="w-full">
    <USelectMenu v-model="value" :items="props.options" :placeholder="props.placeholder" :icon="props.icon" />
  </UFormField>
</template>
