<script setup lang="ts">
import type { FileWithHandle } from 'browser-fs-access'

const props = withDefaults(defineProps<{
  file: FileWithHandle
  width?: number
  height?: number
}>(), {
  width: 200,
  height: 200,
})

const fileUrl = URL.createObjectURL(props.file)
const altText = `${props.file.name} - ${(props.file.size / 1024).toFixed(2)} KB`
</script>

<template>
  <div>
    <NuxtImg :src="fileUrl" :alt="altText" :width="width" :height="height" />
  </div>
</template>
