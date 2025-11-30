<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  labels?: {
    confirm?: string
    cancel?: string
  }
  icon?: string
}>(), {
  title: 'Are you sure?',
  labels: () => ({
    confirm: 'Confirm',
    cancel: 'Cancel',
  }),
  icon: 'i-lucide-circle-alert',
})

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

const open = defineModel<object | boolean | null>({ required: true })
</script>

<template>
  <UModal :open="Boolean(open)" @update:open="(value) => !value ? open = null : undefined">
    <slot name="trigger" />

    <template #title>
      <UEmpty
        class="ModalConfirmBodyComponent"
        variant="naked"
        :icon="icon"
        :title="title"
        :description="description"
      >
        <template #actions>
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:items-center">
            <UButton color="primary" variant="subtle" @click="emit('confirm')">
              <span class="min-w-[8rem]">{{ labels?.confirm }}</span>
            </UButton>
            <UButton color="neutral" variant="subtle" @click="open = null">
              <span class="min-w-[8rem]">{{ labels?.cancel }}</span>
            </UButton>
          </div>
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
