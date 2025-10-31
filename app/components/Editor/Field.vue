<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const props = defineProps<{
  field: IPTCFieldWithValue
  placeholder?: string
}>()

const value = defineModel<string>()

const formattedTitle = computed(() => {
  return props.field.title.charAt(0).toUpperCase() + props.field.title.slice(1)
})
</script>

<template>
  <EditorFieldDate v-if="['date', 'datetime'].includes(field.type)" v-model="value" :title="formattedTitle" :placeholder="placeholder" :original="field.original" />
  <EditorFieldNumber v-else-if="field.type === 'number'" v-model="value" :title="formattedTitle" :placeholder="placeholder" :original="field.original" />
  <EditorFieldTime v-else-if="field.type === 'time'" v-model="value" :title="formattedTitle" :placeholder="placeholder" :original="field.original" />
  <EditorFieldSelect v-else-if="field.type === 'select'" v-model="value" :title="formattedTitle" :placeholder="placeholder" :options="field.options" :original="field.original" />
  <EditorFieldObjectTypeOrAttribute v-else-if="field.type === 'object-type' || field.type === 'object-attribute'" v-model="value" :title="formattedTitle" :type="field.type" :original="field.original" />
  <EditorFieldSubject v-else-if="field.type === 'subject-reference'" v-model="value" :original="field.original" />
  <EditorFieldTextArea v-else-if="field.type === 'textarea'" v-model="value" :title="formattedTitle" :placeholder="placeholder" :original="field.original" />
  <EditorFieldText v-else v-model="value" :title="formattedTitle" :placeholder="placeholder" :original="field.original" />
</template>
