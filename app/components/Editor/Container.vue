<script setup lang="ts">
const { loadedFiles } = useFiles()

const selectedFiles = computed(() => {
  return loadedFiles.value.filter(file => file.isSelected)
})
</script>

<template>
  <div class="w-full h-full">
    <template v-if="selectedFiles.length > 0">
      <EditorFileInformation class="bg-accented/20 rounded-lg" :files="selectedFiles" />
      <div class="pt-8">
        <UCollapsible default-open>
          <UButton
            class="group"
            label="IPTC-IIM"
            color="neutral"
            variant="subtle"
            size="xl"
            trailing-icon="i-lucide-chevron-down"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
            block
          />
          <template #content>
            Some iptc data here
          </template>
        </UCollapsible>
      </div>
    </template>
    <template v-else>
      <p>No files selected!</p>
    </template>
  </div>
</template>
