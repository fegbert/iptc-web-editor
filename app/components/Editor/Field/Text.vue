<script setup lang="ts">
import type { CharacterTypes } from '~/utils/iptc-iim/types'

const props = defineProps<{
  title: string
  placeholder?: string
  icon?: string
  required?: boolean
  octets?: number | { max?: number, min?: number }
  original: string
  allowedCharacters?: CharacterTypes[]
}>()

const value = defineModel<string>()

const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)

const lengths = computed(() => {
  if (typeof props.octets === 'number') {
    return { max: props.octets }
  }

  return props.octets
})

function digits(n?: number) {
  return (n ?? 0).toString().length
}

const characterCountWidth = computed(() => {
  if (!lengths.value) {
    return undefined
  }

  const ch = digits(value.value?.length) + 1 + digits(lengths.value.max)
  return `${ch}ch`
})
</script>

<template>
  <BaseField v-model="value" :title="title" :required="required" :allowed-characters="allowedCharacters" :has-changed="hasChanged" @reset="value = original">
    <UInput
      v-model="value"
      :color="hasChanged ? 'secondary' : undefined"
      :highlight="hasChanged"
      :placeholder="placeholder"
      :maxlength="lengths?.max"
      :icon="icon"
      :ui="{ trailing: 'pointer-events-none' }"
      :style="{ paddingRight: characterCountWidth }"
      class="PaddingFix w-full"
    >
      <template v-if="lengths !== undefined" #trailing>
        <div
          class="text-xs text-muted tabular-nums min-w-0"
          :style="{ width: characterCountWidth, textAlign: 'right' }"
          aria-live="polite"
          role="status"
        >
          {{ value?.length ?? 0 }}/{{ lengths?.max }}
        </div>
      </template>
    </UInput>
  </BaseField>
</template>
