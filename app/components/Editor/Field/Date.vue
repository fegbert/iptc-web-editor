<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const props = withDefaults(defineProps<{
  title: string
  placeholder?: string
  icon?: string
  required?: boolean
}>(), {
  placeholder: 'Select a date',
})

const value = defineModel<string>()

const dateValue = ref<CalendarDate | undefined>()

const formattedTitle = computed(() => {
  return props.title.charAt(0).toUpperCase() + props.title.slice(1)
})

watch(value, (newValue) => {
  if (newValue) {
    const year = Number.parseInt(newValue.slice(0, 4))
    const month = Number.parseInt(newValue.slice(4, 6))
    const day = Number.parseInt(newValue.slice(6, 8))

    const date = new CalendarDate(year, month, day)

    if (!dateValue.value || !date.compare(dateValue.value)) {
      dateValue.value = date
    }
  }
}, { immediate: true })

function updateDate(newDate: CalendarDate) {
  dateValue.value = newDate

  if (newDate) {
    const month = newDate.month.toString().padStart(2, '0')
    const day = newDate.day.toString().padStart(2, '0')
    const year = newDate.year.toString().padStart(4, '0')

    value.value = `${year}${month}${day}`
  }
}
</script>

<template>
  <UFormField :name="props.title" :label="formattedTitle" :required="required" class="w-full">
    <UPopover arrow :content="{ side: 'top' }">
      <UButton color="neutral" variant="subtle" icon="i-lucide-calendar" class="w-full">
        {{ dateValue ? formatDate(dateValue.toString(), 'DD MMMM YYYY') : placeholder }}
      </UButton>

      <template #content>
        <UCalendar :model-value="dateValue" class="p-2" @update:model-value="$event => $event ? updateDate($event as CalendarDate) : undefined" />
      </template>
    </UPopover>
  </UFormField>
</template>
