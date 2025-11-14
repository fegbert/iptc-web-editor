<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui'

const props = defineProps<{
  title: string
  original: string
  placeholder?: string
  icon?: string
  required?: boolean
}>()

const value = defineModel<string>()

const timeValue = ref<{ time: string, offset: string }>({ time: '', offset: '' })

watch(value, (newValue) => {
  if (newValue) {
    const time = newValue.slice(0, 6) // HHMMSS
    const offset = newValue.slice(6) // +HHMM or -HHMM

    if (newValue && (timeValue.value.time !== time || offset !== timeValue.value.offset)) {
      timeValue.value = {
        time: `${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`,
        offset,
      }
    }
  }
}, { immediate: true })

function updateOffset(offset: string) {
  timeValue.value.offset = offset
  value.value = `${timeValue.value.time.replace(/:/g, '')}${offset}`
}

function updateTime(time: string) {
  timeValue.value.time = time

  if (!time) {
    value.value = ''
    timeValue.value.offset = ''
    return
  }

  if (time.split(':').length > 2) {
    value.value = `${time.replace(/:/g, '')}${timeValue.value.offset ? timeValue.value.offset : '+0000'}`
  }
}

const offsets = ['-1200', '-1100', '-1000', '-0930', '-0900', '-0800', '-0700', '-0600', '-0500', '-0430', '-0400', '-0330', '-0300', '-0200', '-0100', '+0000', '+0100', '+0200', '+0300', '+0330', '+0400', '+0430', '+0500', '+0530', '+0545', '+0600', '+0630', '+0700', '+0800', '+0845', '+0900', '+0930', '+1000', '+1030', '+1100', '+1200', '+1245', '+1300', '+1400']

const offsetSelectValues = computed(() => {
  return offsets.map((offset) => {
    const sign = offset.startsWith('+') ? '+' : '-'
    const hours = offset.slice(1, 3)
    const minutes = offset.slice(3, 5)
    return {
      value: offset,
      label: `UTC${sign}${hours}:${minutes}`,
    } as SelectMenuItem
  })
})

const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)

function reset() {
  const originalTime = original.value.slice(0, 6)
  const originalOffset = original.value.slice(6)

  updateTime(originalTime)
  updateOffset(originalOffset)
}
</script>

<template>
  <BaseField v-model="value" :title="title" :required="required" :has-changed="hasChanged" @reset="reset">
    <div class="flex gap-2 items-center">
      <UInput
        :model-value="timeValue.time"
        :color="hasChanged ? 'secondary' : undefined"
        :highlight="hasChanged"
        type="time"
        step="1"
        class="w-1/2"
        @update:model-value="updateTime"
      />
      <USelectMenu
        :model-value="timeValue.offset"
        :disabled="!timeValue.time"
        :color="hasChanged ? 'secondary' : undefined"
        :highlight="hasChanged"
        value-key="value"
        :items="offsetSelectValues"
        placeholder="Select Timezone Offset"
        class="w-1/2"
        @update:model-value="updateOffset"
      />
    </div>
  </BaseField>
</template>
