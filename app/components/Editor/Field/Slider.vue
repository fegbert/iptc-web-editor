<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const props = defineProps<{
  fileId: string
  original?: string
}>()

const field = defineModel<IPTCFieldWithValue & { type: 'slider' }>({ required: true })

const rawValue = computed({
  get: () => field.value.value ? Number(field.value.value) : undefined,
  set: (val: number) => {
    field.value.value = String(val)
  },
})

const fileId = computed(() => props.fileId)
const hasChanged = useHasChanged(fileId, field)
</script>

<template>
  <BaseField v-model="field" :has-changed="hasChanged" @reset="field.value = original ?? ''">
    <div class="flex flex-nowrap text-nowrap gap-2 items-center w-full h-[32px] ring ring-inset ring-accented px-2.5 py-1.5 text-sm rounded-md bg-default">
      <span>{{ field.minLabel }}</span>
      <USlider
        v-model="rawValue"
        :min="field.minValue"
        :max="field.maxValue"
        :step="field.step"
        :color="hasChanged ? 'secondary' : 'neutral'"
        size="xs"
        :tooltip="{
          content: {
            side: 'top',
          },
          delayDuration: 0,
          text: rawValue !== undefined ? String(rawValue) : 'Not Set',
        }"
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
