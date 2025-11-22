<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'
import { CalendarDate } from '@internationalized/date'

defineProps<{
  disabled?: boolean
  required?: boolean
}>()

const field = defineModel<IPTCFieldWithValue & { type: 'date' | 'extra' }>({ required: true })

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

watch(() => field.value.value, (newValue) => {
  if (!newValue) {
    dateValue.value = undefined
    return
  }

  const date = parseDate(newValue)

  if (!dateValue.value || (date && !date.compare(dateValue.value))) {
    dateValue.value = date
  }
}, { immediate: true })

function updateDate(newDate?: CalendarDate) {
  dateValue.value = newDate

  if (newDate) {
    const month = newDate.month.toString().padStart(2, '0')
    const day = newDate.day.toString().padStart(2, '0')
    const year = newDate.year.toString().padStart(4, '0')

    field.value.value = `${year}${month}${day}`
  }
  else {
    field.value.value = ''
  }
}

const hasChanged = useHasChanged(field)
</script>

<template>
  <BaseField v-model="field" :has-changed="hasChanged" :required="required" @reset="updateDate(parseDate(field.original))">
    <template #default="{ error }">
      <UPopover arrow :content="{ side: 'top' }">
        <UButton :color="error ? 'error' : hasChanged ? 'secondary' : 'neutral'" variant="outline" :icon="field.icon ?? 'i-lucide-calendar'" :disabled="disabled" class="w-full h-8">
          <template #trailing>
            <UButton v-if="dateValue" icon="i-lucide-circle-x" variant="link" :color="hasChanged ? 'secondary' : 'neutral'" size="sm" @click.stop="updateDate(undefined)" />
          </template>

          <div class="w-full text-start">
            {{ dateValue ? formatDate(dateValue.toString(), 'DD MMMM YYYY') : (field.placeholder || 'Select a date') }}
          </div>
        </UButton>

        <template #content>
          <UCalendar :model-value="dateValue" class="p-2" @update:model-value="$event => $event ? updateDate($event as CalendarDate) : undefined" />
        </template>
      </UPopover>
    </template>
  </BaseField>
</template>
