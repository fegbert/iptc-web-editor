<script setup lang="ts">
defineProps<{
  title: string
  hasFooter?: boolean
}>()
</script>

<template>
  <UCard variant="subtle" class="BaseCategory">
    <template #header>
      <h2 class="font-semibold">
        {{ title }}
      </h2>
    </template>
    <slot />
    <template v-if="hasFooter" #footer>
      <slot name="footer" />
    </template>
  </UCard>
</template>
