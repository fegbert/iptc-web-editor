<script setup lang="ts">
import type { FileWithHandle } from 'browser-fs-access'

const props = defineProps<{
  files: FileWithHandle[]
}>()

const images = computed(() => {
  return props.files.map(file => URL.createObjectURL(file))
})
</script>

<template>
  <div>
    This will be image :)

    <div v-for="image in images" :key="image">
      <img :src="image" alt="Uploaded Image" style="max-width: 200px; max-height: 200px; margin: 10px;">
    </div>
  </div>
</template>
