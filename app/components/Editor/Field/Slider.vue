<script setup lang="ts">
import type { IPTCField } from '~/utils/iptc-iim/types'

const props = defineProps<{
  title: string
  placeholder?: string
  icon?: string
  required?: boolean
  octets?: IPTCField['octets']
  original: string
  minValue: number
  maxValue: number
  minLabel: string
  maxLabel: string
  step?: number
}>()

const value = defineModel<string>()

const rawValue = computed({
  get: () => value.value ? Number(value.value) : undefined,
  set: (val: number) => {
    value.value = String(val)
  },
})

const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)
</script>

<template>
  <BaseField v-model="value" :title="title" :required="required" :has-changed="hasChanged" @reset="value = original">
    <div class="flex flex-nowrap text-nowrap gap-2 items-center w-full h-[32px]">
      <span>{{ minLabel }}</span>
      <USlider
        v-model="rawValue"
        :min="minValue"
        :max="maxValue"
        :step="step"
        :color="hasChanged ? 'secondary' : 'neutral'"
        size="xs"
      />
      <span>{{ maxLabel }}</span>
      <UButton
        v-if="value"
        :color="hasChanged ? 'secondary' : 'neutral'"
        size="xs"
        variant="link"
        icon="i-lucide-circle-x"
        @click="value = undefined"
      />
    </div>
  </BaseField>
</template>
