<script setup lang="ts">
import type { FileWithHandle } from 'browser-fs-access'
import { fileOpen } from 'browser-fs-access'

const files = defineModel<FileWithHandle[]>()

async function openFile() {
  const blob = await fileOpen({
    mimeTypes: ['image/*'],
    startIn: 'pictures',
    multiple: true,
  })

  files.value = Array.isArray(blob) ? blob : [blob]
}
</script>

<template>
  <div>
    <button @click="openFile">
      Upload Files
    </button>
  </div>
</template>
