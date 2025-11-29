<script setup lang="ts">
const props = defineProps<{
  fileIds: string[]
}>()

const { loadedFiles } = useFiles()

const fileToShow = computed(() => {
  if (props.fileIds.length === 0) {
    return null
  }

  const firstFileId: string = props.fileIds[0]!
  return loadedFiles.value[firstFileId]
})

const file = computedAsync(async () => {
  if (!fileToShow.value) {
    return undefined
  }
  return await loadImageForPreview(fileToShow.value.file)
})
</script>

<template>
  <div v-if="fileToShow" class="flex h-[22rem] gap-4">
    <NuxtImg
      :src="file"
      :alt="fileToShow.file.name"
      :style="{ height: '22rem' }"
    />
    <div class="flex flex-col w-full justify-center py-4">
      <h1 class="text-lg font-bold">
        File Properties
      </h1>
      <table class="w-1/2">
        <tbody>
          <tr>
            <td class="PropertyColumn">
              Filename:
            </td>
            <td>{{ fileToShow.file.name }}</td>
          </tr>
          <tr>
            <td class="PropertyColumn">
              File Size:
            </td>
            <td>{{ (fileToShow.file.size / 1024 / 1024).toFixed(2) }} MB</td>
          </tr>
          <tr>
            <td class="PropertyColumn">
              File Type:
            </td>
            <td>{{ fileToShow.file.type }}</td>
          </tr>
          <tr>
            <td class="PropertyColumn">
              Last Modified:
            </td>
            <td>
              {{ formatDate(fileToShow.file.lastModified) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.PropertyColumn {
    @apply font-semibold w-[8rem];
}
</style>
