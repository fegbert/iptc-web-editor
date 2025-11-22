<script setup lang="ts">
const props = defineProps<{
  fileIds: Set<string>
}>()

const { fileById } = useFiles()

const fileToShow = computed(() => {
  if (props.fileIds.size === 0) {
    return null
  }

  const firstFileId: string = Array.from(props.fileIds)[0]!
  return fileById(firstFileId)
})

const file = computed(() => fileToShow.value ? URL.createObjectURL(fileToShow.value?.file) : undefined)
</script>

<template>
  <div v-if="fileToShow" class="flex gap-4">
    <div class="max-w-[20rem]">
      <NuxtImg :src="file" class="rounded-l-lg" />
    </div>
    <div class="flex flex-col w-full justify-center">
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
