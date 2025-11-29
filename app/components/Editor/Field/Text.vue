<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const props = defineProps<{
  fileId: string
  original?: string
  disabled?: boolean
  required?: boolean
}>()

const field = defineModel<IPTCFieldWithValue & { type: 'text' | 'extra' | 'reference' }>({ required: true })

const fileId = computed(() => props.fileId)
const hasChanged = useHasChanged(fileId, field)

const currentValue = computed(() => field.value.value || '')
const { limits, characterCountWidth, characterCountText } = useCharacterLimit(currentValue, field.value.octets)
</script>

<template>
  <BaseField v-model="field" :has-changed="hasChanged" :required="required" @reset="field.value = original ?? ''">
    {{ original }} {{ fileId }}
    <UInput
      v-model="field.value"
      :color="hasChanged ? 'secondary' : undefined"
      :highlight="hasChanged"
      :placeholder="field.placeholder"
      :maxlength="limits?.max"
      :icon="field.icon"
      :disabled="disabled"
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
