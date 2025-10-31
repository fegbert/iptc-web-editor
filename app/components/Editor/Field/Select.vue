<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  options: { label: string, value: string }[]
  placeholder?: string
  icon?: string
  required?: boolean
}>(), {
  placeholder: 'Select an option',
})

const value = defineModel<string>()

const rawValue = ref(props.options.find((option) => {
  if (option.value === value.value) {
    return true
  }

  return false
}))

watch(value, (newValue) => {
  if (rawValue.value === newValue) {
    return
  }

  rawValue.value = props.options.find(option => option.value === newValue)
})

watch(rawValue, (newValue) => {
  if (newValue?.value === value.value) {
    return
  }

  value.value = newValue?.value
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
      :items="props.options"
      :placeholder="props.placeholder"
      :icon="props.icon"
    >
      <template #default>
        <div class="flex items-center justify-between w-full">
          <span v-if="rawValue?.value">{{ rawValue.label }}</span>
          <span v-else class="text-default/50">{{ props.placeholder }}</span>
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
    </USelectMenu>
  </UFormField>
</template>
