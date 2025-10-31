<script setup lang="ts">
import { objectAttributes, objectTypes } from '~/utils/iptc-iim/types'

const props = defineProps<{
  title: string
  type: 'object-type' | 'object-attribute'
  required?: boolean
}>()

const value = defineModel<string>()

const objectData = computed(() => {
  return props.type === 'object-type' ? objectTypes : objectAttributes
})

const selectOptions = objectData.value.map(data => ({
  label: data.name,
  number: data.number,
  value: `${data.number}:${data.name}`,
}))

const rawValue = computed({
  get: () => selectOptions.find(option => option.value === value.value),
  set: (newValue) => {
    value.value = newValue?.value ?? ''
  },
})

const formattedTitle = useFieldTitle(props.title)

const openMenu = ref(false)

function clear() {
  rawValue.value = undefined
  openMenu.value = false
}
</script>

<template>
  <UFormField :name="props.title" :label="formattedTitle" :required="required" class="w-full">
    <USelectMenu
      v-model="rawValue"
      v-model:open="openMenu"
      class="w-full"
      :ui="{
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-100 hover:cursor-pointer',
      }"
      :items="selectOptions"
    >
      <template #default>
        <div class="flex items-center justify-between w-full">
          <div v-if="rawValue?.value">
            <span class="text-sm text-default/75">{{ `${rawValue.number} ` }}</span>
            <span> {{ rawValue.label }}</span>
          </div>
          <span v-else class="text-default/50">Select an object {{ props.type === 'object-type' ? 'type' : 'attribute' }}</span>
          <UButton
            v-if="rawValue"
            class="p-0.5 hover:bg-transparent hover:cursor-pointer active:bg-transparent"
            size="sm"
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            @click.stop="clear"
          />
        </div>
      </template>
      <template #item-leading="{ item }">
        <span class="text-sm text-default/75">{{ item.number }}</span>
      </template>
    </USelectMenu>
  </UFormField>
</template>
