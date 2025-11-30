<script setup lang="ts">
const emit = defineEmits<{
  (e: 'close'): void
}>()

const open = defineModel<boolean>({ required: true })
</script>

<template>
  <UModal :open="Boolean(open)" @update:open="(value) => !value ? emit('close') : undefined">
    <slot name="trigger" />

    <template #title>
      <UEmpty
        class="ModalConfirmBodyComponent"
        variant="naked"
        icon="i-lucide-circle-alert"
        title="Your browser is not fully supported"
      >
        <template #description>
          <div class="text-center space-y-4">
            <p>The browser you are using currently does not support directly reading and saving files directly to your local file system. For the best experience with this application, please consider using a supported browser such as Google Chrome.</p>
            <p>
              For more information about which browsers are supported, please visit
              <ULink class="text-blue-400 hover:text-blue-300 underline" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker#browser_compatibility" target="_blank">
                the official documentation
              </ULink>
            </p>
          </div>
        </template>

        <template #actions>
          <UButton color="primary" variant="subtle" @click="emit('close')">
            <span class="min-w-[16rem]">I understand</span>
          </UButton>
        </template>
      </UEmpty>
    </template>
  </UModal>
</template>

<style>
div:has(.ModalConfirmBodyComponent) {
  width: 100%;
}
</style>
