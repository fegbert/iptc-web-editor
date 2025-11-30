<script setup lang="ts">
import { fileOpen } from 'browser-fs-access'

const { addFiles } = useFiles()

async function openFiles() {
  const blob = await fileOpen({
    mimeTypes: ['image/jpeg'],
    startIn: 'pictures',
    multiple: true,
  })

  await addFiles(blob)
}
</script>

<template>
  <div>
    <UButton icon="i-lucide-folder-open" class="justify-center w-full font-semibold" @click="openFiles">
      Load Files
    </UButton>
  </div>
</template>
