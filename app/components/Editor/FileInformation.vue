<script setup lang="ts">
const STACK_SIZE = 3
const OFFSET = 5
const WIDTH = 200
const HEIGHT = 280

const { loadedFiles } = useFiles()
const { fileChanges } = useFileState()
const { selectedIds } = useFileSelection()

const isMultiple = computed(() => selectedIds.value.length > 1)

const singleFile = computed(() => selectedIds.value[0] !== undefined ? loadedFiles.value[selectedIds.value[0]] : undefined)
const singleUrl = computedAsync(() => {
  if (!singleFile.value) {
    return undefined
  }

  return singleFile.value.previewUrl ? singleFile.value.previewUrl : loadImageForPreview(singleFile.value.buffer)
})

const stackFiles = computed(() => selectedIds.value.slice(0, STACK_SIZE).map(id => loadedFiles.value[id]).filter(f => !!f))
const extraCount = computed(() => Math.max(0, selectedIds.value.length - STACK_SIZE))
const stackUrls = computedAsync(() =>
  Promise.all(stackFiles.value.map(async (file) => {
    return file.previewUrl ? file.previewUrl : await loadImageForPreview(file.buffer)
  })), [])

const totalSizeFormatted = computed(() => {
  const bytes = selectedIds.value.reduce((sum, id) => sum + (loadedFiles.value[id]?.data.size ?? 0), 0)
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(2)} KB`
})

const withMetadataCount = computed(() => selectedIds.value.filter(id => Object.keys(loadedFiles.value[id]?.metadata ?? {}).length > 0).length)

const modifiedCount = computed(() => selectedIds.value.filter(id => fileChanges(id) > 0).length)
</script>

<template>
  <div class="flex h-[22rem] gap-4 p-4">
    <!-- Single File Preview -->
    <template v-if="!isMultiple">
      <NuxtImg v-if="singleUrl" :src="singleUrl" :alt="singleFile?.data.name" :style="{ height: '22rem' }" />
      <USkeleton v-else class="h-full w-1/4" />
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
              <td>{{ singleFile?.data.name }}</td>
            </tr>
            <tr>
              <td class="PropertyColumn">
                File Size:
              </td>
              <td>{{ (singleFile?.data.size ?? 0 / 1024 / 1024).toFixed(2) }} MB</td>
            </tr>
            <tr>
              <td class="PropertyColumn">
                File Type:
              </td>
              <td>{{ singleFile?.data.type }}</td>
            </tr>
            <tr v-if="singleFile?.data.lastModified">
              <td class="PropertyColumn">
                Last Modified:
              </td>
              <td>
                {{ formatDate(singleFile?.data.lastModified) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Multiple Files Preview -->
    <template v-else>
      <div
        class="relative shrink-0 self-center"
        :style="{
          width: `${WIDTH + (stackFiles.length - 1) * OFFSET}px`,
          height: `${HEIGHT + (stackFiles.length - 1) * OFFSET}px`,
        }"
      >
        <div
          v-for="(file, index) in stackFiles"
          :key="file.id"
          class="absolute rounded-md overflow-hidden shadow-md bg-accented"
          :style="{
            width: `${WIDTH}px`,
            height: `${HEIGHT}px`,
            top: `${(stackFiles.length - 1 - index) * OFFSET}px`,
            left: `${(stackFiles.length - 1 - index) * OFFSET}px`,
            zIndex: stackFiles.length - index,
          }"
        >
          <NuxtImg v-if="stackUrls?.[index]" :src="stackUrls[index]" :alt="file.data.name" class="w-full h-full object-cover" />
          <USkeleton v-else class="w-full h-full" />
        </div>
        <div v-if="extraCount > 0" class="absolute bottom-1 right-1 z-10 text-xs font-semibold px-2 py-1 rounded-full bg-accented shadow">
          +{{ extraCount }} more
        </div>
      </div>

      <div class="flex flex-col justify-center gap-3 pl-2">
        <h1 class="text-lg font-bold">
          File Properties
        </h1>
        <table class="w-1/2">
          <tbody>
            <tr>
              <td class="PropertyColumn">
                Selected:
              </td>
              <td class="PropertyValue">
                {{ selectedIds.length }}
              </td>
            </tr>
            <tr>
              <td class="PropertyColumn">
                Total Size:
              </td>
              <td class="PropertyValue">
                {{ totalSizeFormatted }}
              </td>
            </tr>
            <tr>
              <td class="PropertyColumn">
                With Metadata:
              </td>
              <td class="PropertyValue">
                {{ withMetadataCount }}
              </td>
            </tr>
            <tr>
              <td class="PropertyColumn">
                Unsaved:
              </td>
              <td class="PropertyValue">
                {{ modifiedCount }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.PropertyColumn {
    @apply font-semibold whitespace-nowrap w-[8rem] pr-2;
}

.PropertyValue {
    @apply whitespace-nowrap;
}
</style>
