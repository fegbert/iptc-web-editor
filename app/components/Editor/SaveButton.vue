<script setup lang="ts">
const { filesChanged, saveAll } = useFileState()
</script>

<template>
  <div>
    <UButton :disabled="!filesChanged" icon="i-lucide-save" class="w-full" @click="saveAll">
      Save {{ filesChanged }} File{{ filesChanged === 1 ? '' : 's' }}
    </UButton>
  </div>
</template>
