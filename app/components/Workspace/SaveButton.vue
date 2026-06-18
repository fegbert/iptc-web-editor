<script setup lang="ts">
const { isSaving, saveAll } = useWorkspace()
const { filesChanged } = useFileState()
</script>

<template>
  <UButton
    icon="i-lucide-save"
    class="w-full font-semibold"
    :loading="isSaving"
    :disabled="!filesChanged"
    @click="saveAll"
  >
    Save {{ filesChanged }} File{{ filesChanged !== 1 ? 's' : '' }}
  </UButton>
</template>
