<script setup lang="ts">
const emit = defineEmits<{
  (e: 'close'): void
}>()

const open = defineModel<boolean>({ required: true })
</script>

<template>
  <UModal
    :open="Boolean(open)"
    class="ModalConfirmBodyComponent"
    title="Templates"
    description="Select a template to apply predefined metadata values to the selected file(s)."
    @update:open="(value) => !value ? emit('close') : undefined"
  >
    <template #actions>
      <UButton color="primary" @click="console.log('create')">
        Testing
      </UButton>
    </template>
  </UModal>
</template>

<style>
div:has(.ModalConfirmBodyComponent) {
  width: 100%;
}
</style>
