<script setup lang="ts">
import { supported } from 'browser-fs-access'

const { filesChanged, saveAll } = useFileState()
</script>

<template>
  <div class="flex items-center gap-2">
    <UTooltip v-if="!supported" :content="{ align: 'center', side: 'left' }" :ui="{ content: 'h-auto' }" :delay-duration="0">
      <template #content>
        <p class="max-w-sm text-wrap">
          Your browser does not support saving files directly to your local file system. For the best experience, please consider using a chromium-based browser.
        </p>
      </template>

      <div class="flex items-center justify-center border border-neutral-600 rounded-md bg-accented p-1">
        <UIcon name="i-lucide-alert-triangle" size="22" class="text-warning" />
      </div>
    </UTooltip>
    <UButton :disabled="!filesChanged" icon="i-lucide-save" class="w-full font-semibold" @click="saveAll">
      {{ supported ? 'Save' : 'Download' }} {{ filesChanged }} File{{ filesChanged === 1 ? '' : 's' }}
    </UButton>
  </div>
</template>
