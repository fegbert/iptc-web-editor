<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const props = defineProps<{
  fileId: string
  originalCode?: string
  originalName?: string
}>()

const code = defineModel<IPTCFieldWithValue & { type: 'location' }>('code', { required: true })
const name = defineModel<IPTCFieldWithValue & { type: 'extra' }>('name', { required: true })

const hasChanged = useHasChanged(props.fileId, code)

const selectedCountry = computed({
  get: () => ({
    label: code.value.value,
    value: name.value.value,
  }),
  set: (newValue) => {
    if (!newValue || !newValue.value) {
      code.value.value = ''
      name.value.value = ''
      return
    }

    code.value.value = newValue.label
    name.value.value = newValue.value
  },
})

const formattedTitle = computed(() => {
  return code.value.title.split('Code')[0]?.trim() ?? code.value.title
})
</script>

<template>
  <BaseField v-model="code" class="w-full" :title="formattedTitle" :has-changed="hasChanged" @reset="selectedCountry = { label: originalCode ?? '', value: originalName ?? '' }">
    <BaseSelect
      v-model="selectedCountry"
      :options="countries"
      :has-changed="hasChanged"
      :placeholder="code.placeholder ?? name.placeholder ?? 'Select a location'"
      virtualize
    >
      <template #leading="{ modelValue: country, ui }">
        <span v-if="country?.value" class="size-5 text-default/75 text-center">
          {{ country.value }}
        </span>
        <UIcon v-else name="i-lucide-earth" :class="ui.leadingIcon()" />
      </template>

      <template #label="{ modelValue: country }">
        <span :class="country.value.length > 2 ? 'pl-1' : ''">{{ country.label }}</span>
      </template>

      <template #item-leading="{ item: country }">
        <span :class="country.value.length > 2 ? 'mr-1' : ''" class="size-5 text-default/75 text-center">{{ country.value }}</span>
      </template>
    </BaseSelect>
  </BaseField>
</template>
