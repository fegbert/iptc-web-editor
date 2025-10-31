<script setup lang="ts">
withDefaults(defineProps<{
  options: { label: string, value: string, number?: string }[]
  placeholder?: string
  icon?: string
  disabled?: boolean
  clearable?: boolean
}>(), {
  clearable: true,
})

const value = defineModel<{ label: string, value: string, number?: string }>()

const openMenu = ref(false)

function clear() {
  value.value = undefined
  openMenu.value = false
}
</script>

<template>
  <USelectMenu
    v-model="value"
    v-model:open="openMenu"
    :disabled="disabled"
    class="w-full"
    :ui="{
      trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-100 hover:cursor-pointer',
    }"
    :items="options"
    :icon="icon"
  >
    <template #default>
      <div class="flex items-center justify-between w-full">
        <slot v-if="value?.value" name="label" />
        <span v-else-if="placeholder" class="text-default/50">{{ placeholder }}</span>
        <slot v-else name="placeholder" />
        <UButton
          v-if="value && clearable"
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
      <slot name="item-leading" :item="item" />
    </template>
  </USelectMenu>
</template>
