<script setup lang="ts">
import { fileOpen } from 'browser-fs-access'

const { uploadFiles, isUploading } = useWorkspace()

async function upload() {
  let files: File[]

  try {
    files = await fileOpen({
      mimeTypes: ['image/jpeg'],
      startIn: 'pictures',
      multiple: true,
    })
  }
  catch {
    return
  }

  await uploadFiles(files)
}
</script>

<template>
  <UButton icon="lucide:upload" class="justify-center w-full font-semibold" :loading="isUploading" @click="upload">
    Upload Files
  </UButton>
</template>
