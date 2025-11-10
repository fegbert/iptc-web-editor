<script setup lang="ts">
import type { CharacterTypes } from '~/utils/iptc-iim/types'

const props = defineProps<{
  title: string
  original: string
  placeholder?: string
  required?: boolean
  allowedCharacters?: CharacterTypes[]
}>()

const value = defineModel<string>()

const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)
</script>

<template>
  <BaseField v-model="value" :title="title" :original="original" :allowed-characters="allowedCharacters" :has-changed="hasChanged" :required="required" @reset="value = original">
    <UTextarea
      v-model="value"
      :placeholder="placeholder"
      autoresize
      :maxrows="5"
      :color="hasChanged ? 'secondary' : undefined"
      :highlight="hasChanged"
    />
  </BaseField>
</template>
