<script setup lang="ts">
import type { FileWithHandle } from 'browser-fs-access'

const files = defineModel<FileWithHandle[]>()

</script>

<template>
  <div>
    Welcome to the IPTC Web Editor!

    <div>
      <ClientOnly>
        <FileUpload v-model="files" />
        <FileDisplay :files="files ?? []" />
      </ClientOnly>
    </div>
  </div>
</template>
