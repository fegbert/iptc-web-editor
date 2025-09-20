<script setup lang="ts">
import type { FileWithHandle } from 'browser-fs-access'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'
import { fileOpen } from 'browser-fs-access'

const { data: savedFiles } = useIDBKeyval<FileWithHandle[]>('uploaded-images', [])
const files = defineModel<FileWithHandle[]>()

async function openFile() {
  const blob = await fileOpen({
    mimeTypes: ['image/*'],
    startIn: 'pictures',
    multiple: true,
  })

  files.value = [...files.value ?? [], ...blob]
  savedFiles.value = [...savedFiles.value ?? [], ...blob]
}
</script>

<template>
  <div>
    <button type="button" @click="openFile">
      Upload Files
    </button>
  </div>
</template>
