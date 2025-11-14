<script setup lang="ts">
import type { CharacterTypes, IPTCField } from '~/utils/iptc-iim/types'

const props = defineProps<{
  title: string
  placeholder?: string
  icon?: string
  required?: boolean
  octets?: IPTCField['octets']
  original: string
  allowedCharacters?: CharacterTypes[]
}>()

const value = defineModel<string>()

const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)

const { limits, characterCountWidth, characterCountText } = useCharacterLimit(value, props.octets)
</script>

<template>
  <BaseField v-model="value" :title="title" :required="required" :allowed-characters="allowedCharacters" :has-changed="hasChanged" @reset="value = original">
    <UInput
      v-model="value"
      :color="hasChanged ? 'secondary' : undefined"
      :highlight="hasChanged"
      :placeholder="placeholder"
      :maxlength="limits?.max"
      :icon="icon"
      :ui="{ trailing: 'pointer-events-none' }"
      :style="{ paddingRight: characterCountWidth }"
      class="w-full"
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
    </UInput>
  </BaseField>
</template>
