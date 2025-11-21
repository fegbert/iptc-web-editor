<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const field = defineModel<IPTCFieldWithValue & { type: 'slider' }>({ required: true })

const rawValue = computed({
  get: () => field.value.value ? Number(field.value.value) : undefined,
  set: (val: number) => {
    field.value.value = String(val)
  },
})

const hasChanged = useHasChanged(field)
</script>

<template>
  <BaseField v-model="field" :has-changed="hasChanged" @reset="field.value = field.original">
    <div class="flex flex-nowrap text-nowrap gap-2 items-center w-full h-[32px]">
      <span>{{ field.minLabel }}</span>
      <USlider
        v-model="rawValue"
        :min="field.minValue"
        :max="field.maxValue"
        :step="field.step"
        :color="hasChanged ? 'secondary' : 'neutral'"
        size="xs"
      />
      <span>{{ field.maxLabel }}</span>
      <UButton
        v-if="field.value"
        :color="hasChanged ? 'secondary' : 'neutral'"
        size="xs"
        variant="link"
        icon="i-lucide-circle-x"
        @click="field.value = ''"
      />
    </div>
  </BaseField>
</template>
