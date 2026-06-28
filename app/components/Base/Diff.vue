<script setup lang="ts">
import { diffWords } from 'diff'

const props = defineProps<{
  oldText: string
  newText: string
  mode: 'old' | 'new'
}>()

const parts = computed(() => diffWords(props.oldText, props.newText))
</script>

<template>
  <span class="text-sm leading-relaxed">
    <template v-for="(part, index) in parts" :key="index">
      <span
        v-if="mode === 'old' && !part.added"
        :class="part.removed ? 'bg-error/20 text-error line-through rounded px-0.5' : ''"
      >
        {{ part.value }}
      </span>
      <span
        v-else-if="mode === 'new' && !part.removed"
        :class="part.added ? 'bg-success/20 text-success rounded px-0.5' : ''"
      >
        {{ part.value }}
      </span>
    </template>
  </span>
</template>
