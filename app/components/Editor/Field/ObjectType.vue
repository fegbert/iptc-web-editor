<script setup lang="ts">
import { objectTypes } from '~/utils/iptc-iim/types'

const props = defineProps<{
  title: string
  required?: boolean
}>()

const value = defineModel<string>()

const objectTypeSelectOptions = objectTypes.map(type => ({
  label: type.name,
  number: type.number,
  value: `${type.number}:${type.name}`,
}))

const rawValue = computed({
  get: () => objectTypeSelectOptions.find(option => option.value === value.value),
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
    {{ rawValue }}
    <USelectMenu
      v-model="rawValue"
      v-model:open="openMenu"
      class="w-full"
      :ui="{
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-100 hover:cursor-pointer',
      }"
      :items="objectTypeSelectOptions"
    >
      <template #default>
        <div class="flex items-center justify-between w-full">
          <div v-if="rawValue?.value">
            <span class="text-sm text-default/75">{{ `${rawValue.number} ` }}</span>
            <span> {{ rawValue.label }}</span>
          </div>
          <span v-else class="text-default/50">Select an object type</span>
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
