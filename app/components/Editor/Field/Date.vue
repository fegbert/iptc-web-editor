<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const props = withDefaults(defineProps<{
  title: string
  placeholder?: string
  icon?: string
  required?: boolean
  original: string
}>(), {
  placeholder: 'Select a date',
})

const value = defineModel<string>()

const dateValue = ref<CalendarDate | undefined>()

function parseDate(value?: string): CalendarDate | undefined {
  if (value && value.length === 8) {
    const year = Number.parseInt(value.slice(0, 4))
    const month = Number.parseInt(value.slice(4, 6))
    const day = Number.parseInt(value.slice(6, 8))

    return new CalendarDate(year, month, day)
  }

  return undefined
}

watch(value, (newValue) => {
  if (newValue) {
    const date = parseDate(newValue)

    if (!dateValue.value || (date && !date.compare(dateValue.value))) {
      dateValue.value = date
    }
  }
}, { immediate: true })

function updateDate(newDate?: CalendarDate) {
  dateValue.value = newDate

  if (newDate) {
    const month = newDate.month.toString().padStart(2, '0')
    const day = newDate.day.toString().padStart(2, '0')
    const year = newDate.year.toString().padStart(4, '0')

    value.value = `${year}${month}${day}`
  }
  else {
    value.value = ''
  }
}
const original = computed(() => props.original)
const hasChanged = useHasChanged(original, value)
</script>

<template>
  <BaseField v-model="value" :title="title" :required="required" :has-changed="hasChanged" @reset="updateDate(parseDate(original))">
    <UPopover arrow :content="{ side: 'top' }">
      <UButton :color="hasChanged ? 'secondary' : 'neutral'" variant="subtle" icon="i-lucide-calendar" class="w-full h-8">
        <template #trailing>
          <UButton v-if="dateValue" icon="i-lucide-circle-x" variant="link" :color="hasChanged ? 'secondary' : 'neutral'" size="sm" @click.stop="updateDate(undefined)" />
        </template>

        <div class="w-full text-start">
          {{ dateValue ? formatDate(dateValue.toString(), 'DD MMMM YYYY') : placeholder }}
        </div>
      </UButton>

      <template #content>
        <UCalendar :model-value="dateValue" class="p-2" @update:model-value="$event => $event ? updateDate($event as CalendarDate) : undefined" />
      </template>
    </UPopover>
  </BaseField>
</template>
