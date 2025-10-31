<script setup lang="ts">
defineProps<{
  title: string
  hasChanged: boolean
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'reset'): void
}>()
</script>

<template>
  <UFormField :name="title" :required="required" class="FormField w-full">
    <template #label>
      <div class="flex items-center w-full h-7 gap-1">
        <span>{{ title }}</span>
        <UButton v-if="hasChanged" size="sm" color="secondary" variant="ghost" icon="i-lucide-timer-reset" @click="emit('reset')" />
      </div>
    </template>
    <slot />
  </UFormField>
</template>

<style scoped>
.FormField :deep(label) {
  width: 100%;
}
</style>
