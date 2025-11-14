<script setup lang="ts">
import type { CharacterTypes, IPTCField } from '~/utils/iptc-iim/types'

const props = defineProps<{
  title: string
  original: string
  placeholder?: string
  required?: boolean
  octets?: IPTCField['octets']
  allowedCharacters?: CharacterTypes[]
}>()

const value = defineModel<string>()

const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)

const { limits, characterCountWidth, characterCountText } = useCharacterLimit(value, props.octets)
</script>

<template>
  <BaseField v-model="value" :title="title" :original="original" :allowed-characters="allowedCharacters" :has-changed="hasChanged" :required="required" @reset="value = original">
    <UTextarea
      v-model="value"
      class="w-full"
      :placeholder="placeholder"
      autoresize
      :maxrows="5"
      :color="hasChanged ? 'secondary' : undefined"
      :highlight="hasChanged"
      :maxlength="limits?.max"
      :ui="{ trailing: 'pointer-events-none' }"
      :style="{ paddingRight: characterCountWidth }"
    >
      <template v-if="limits !== undefined" #trailing>
        <div
          class="text-xs text-muted tabular-nums min-w-0"
          :style="{ width: characterCountWidth, textAlign: 'right' }"
          aria-live="polite"
          role="status"
        >
          {{ characterCountText }}
        </div>
      </template>
    </UTextarea>
  </BaseField>
</template>
