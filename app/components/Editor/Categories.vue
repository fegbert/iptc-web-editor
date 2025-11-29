<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'
import { categories } from '~/utils/iptc-iim/categories'

defineProps<{
  fileId: string
}>()

const state = defineModel<IPTCFieldWithValue[]>()

const categoryKeys = new Set(categories.map((category) => {
  return category.rows.flat().map(field => field.key)
}).flat())

const fieldsByKey = computed({
  get: () => {
    if (!state.value) {
      return {}
    }
    const map: Record<string, IPTCFieldWithValue> = state.value.reduce<Record<string, IPTCFieldWithValue>>((acc, field) => {
      if (categoryKeys.has(field.key)) {
        acc[field.key] = field
      }
      return acc
    }, {})
    return map
  },
  set: (newValue: Record<string, IPTCFieldWithValue>) => {
    if (!state.value) {
      return
    }

    state.value = state.value.map((field) => {
      if (newValue[field.key]) {
        return newValue[field.key] ?? field
      }
      return field
    })
  },
})

function getExtraFields(key: string): (IPTCFieldWithValue & { type: 'extra' })[] {
  if (!fieldsByKey.value || !fieldsByKey.value[key]) {
    return []
  }

  const field = fieldsByKey.value[key]

  if (field.type === 'location') {
    const nameField = fieldsByKey.value[field.nameKey]
    return nameField && isFieldType('extra', nameField) ? [nameField] : []
  }

  if (field.type === 'reference') {
    const dateField = fieldsByKey.value[field.dateKey]
    const numberField = fieldsByKey.value[field.numberKey]
    const extraFields: (IPTCFieldWithValue & { type: 'extra' })[] = []

    if (dateField && isFieldType('extra', dateField)) {
      extraFields.push(dateField)
    }

    if (numberField && isFieldType('extra', numberField)) {
      extraFields.push(numberField)
    }

    return extraFields
  }

  return []
}

function updateExtraField(updatedFields: (IPTCFieldWithValue & { type: 'extra' })[]) {
  if (!fieldsByKey.value) {
    return
  }

  fieldsByKey.value = {
    ...fieldsByKey.value,
    ...updatedFields.reduce((acc, field) => {
      acc[field.key] = field
      return acc
    }, {} as Record<string, IPTCFieldWithValue>),
  }
}
</script>

<template>
  <div v-if="state" class="flex flex-col gap-5">
    <BaseCategory v-for="category in categories" :key="category.title" :title="category.title">
      <div class="flex flex-col gap-2">
        <div v-for="(row, index) in category.rows" :key="row.join(':')" class="flex flex-col sm:flex-row gap-2 w-full">
          <template v-for="{ key, width } in category.rows[index]" :key="`${index}-${key}`">
            <EditorField
              v-if="fieldsByKey[key]"
              v-model="fieldsByKey[key]"
              :extra="getExtraFields(key)"
              :style="width ? `width: ${width}%` : ''"
              :file-id="fileId"
              @update:extra="updateExtraField"
            />
          </template>
        </div>
      </div>
    </BaseCategory>
  </div>
</template>
