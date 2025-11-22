<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const field = defineModel<IPTCFieldWithValue & { type: 'number' }>({ required: true })

const rawValue = computed<number | undefined>({
  get() {
    if (!field.value.value) {
      return undefined
    }

    const num = Number(field.value.value)
    return Number.isNaN(num) ? undefined : num
  },
  set(val: number | undefined) {
    field.value.value = val !== undefined ? String(val) : ''
  },
})

const hasChanged = useHasChanged(field)
</script>

<template>
  <BaseField v-model="field" :has-changed="hasChanged" @reset="field.value = field.original">
    <UInputNumber
      v-model="rawValue"
      :min="field.minValue"
      :max="field.maxValue"
      :placeholder="field.placeholder"
      :color="hasChanged ? 'secondary' : undefined"
      :increment="{ color: hasChanged ? 'secondary' : 'neutral' }"
      :decrement="{ color: hasChanged ? 'secondary' : 'neutral' }"
      :highlight="hasChanged"
      orientation="vertical"
      class="w-full"
    />
  </BaseField>
</template>
