<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui'

const props = defineProps<{
  title: string
  placeholder?: string
  icon?: string
  required?: boolean
}>()

const value = defineModel<string>()

const timeValue = ref<{ time: string, timezone: string }>({ time: '', timezone: '' })

watch(value, (newValue) => {
  if (newValue) {
    const time = newValue.slice(0, 6) // HHMMSS
    const timezone = newValue.slice(6) // +HHMM or -HHMM

    if (newValue && (timeValue.value.time !== time || timezone !== timeValue.value.timezone)) {
      timeValue.value = {
        time: `${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`,
        timezone,
      }
    }
  }
}, { immediate: true })

const timezoneOptions = timezones.map(timezone => ({
  label: `${timezone.abbreviation} (UTC${timezone.offset})`,
  value: timezone.offset,
}))

const formattedTitle = computed(() => {
  return props.title.charAt(0).toUpperCase() + props.title.slice(1)
})

function updateTimezone(offset: string) {
  timeValue.value.timezone = offset
  value.value = `${timeValue.value.time.replace(/:/g, '')}${offset}`
}

function updateTime(time: string) {
  timeValue.value.time = time
  value.value = `${time.replace(/:/g, '')}${timeValue.value.timezone}`
}
</script>

<template>
  <UFormField :name="props.title" :label="formattedTitle" :required="required" class="w-full">
    <div class="flex gap-2 items-center">
      <UInput :model-value="timeValue.time" type="time" step="1" class="w-1/2" @update:model-value="updateTime" />
      <USelectMenu
        :model-value="timeValue.timezone"
        value-key="value"
        :items="timezoneOptions"
        placeholder="Select timezone"
        class="w-1/2"
        @update:model-value="updateTimezone"
      />
    </div>
  </UFormField>
</template>
