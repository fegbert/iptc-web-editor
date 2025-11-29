<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const props = defineProps<{
  fileId: string
  original?: string
}>()

const field = defineModel<IPTCFieldWithValue & { type: 'textarea' }>({ required: true })

const hasChanged = useHasChanged(props.fileId, field)

const currentValue = computed(() => field.value.value || '')
const { limits, characterCountWidth, characterCountText } = useCharacterLimit(currentValue, field.value.octets)
</script>

<template>
  <BaseField v-model="field" :has-changed="hasChanged" @reset="field.value = original ?? ''">
    <UTextarea
      v-model="field.value"
      class="w-full"
      :placeholder="field.placeholder"
      autoresize
      :maxrows="5"
      :color="hasChanged ? 'secondary' : undefined"
      :highlight="hasChanged"
      :maxlength="limits?.max"
      :ui="{ trailing: 'pointer-events-none' }"
      :style="{ paddingRight: characterCountWidth }"
      :icon="field.icon"
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
