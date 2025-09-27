<script setup lang="ts">
const { loadedFiles } = useFiles()

const selectedFiles = computed(() => {
  return loadedFiles.value.filter(file => file.isSelected)
})
</script>

<template>
  <div>
    <div v-if="selectedFiles.length > 0">
      <p>Selected Files:</p>
      <ul>
        <li v-for="file in selectedFiles" :key="file.file.name">
          {{ file.file.name }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No files selected!</p>
    </div>
  </div>
</template>
