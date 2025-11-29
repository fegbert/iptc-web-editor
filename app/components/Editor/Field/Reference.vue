<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

withDefaults(defineProps<{
  fileId: string
  originalService?: string
  originalDate?: string
  originalNumber?: string
  alignment?: 'vertical' | 'horizontal'
}>(), {
  alignment: 'horizontal',
})

const service = defineModel<IPTCFieldWithValue & { type: 'reference' }>({ required: true })
const date = defineModel<IPTCFieldWithValue & { type: 'extra' }>('date', { required: true })
const number = defineModel<IPTCFieldWithValue & { type: 'extra' }>('number', { required: true })

watchEffect(() => {
  if (!service.value.value) {
    date.value.value = ''
    number.value.value = ''
  }
})
</script>

<template>
  <div class="flex w-full gap-2" :class="alignment === 'vertical' ? 'flex-col' : ''">
    <EditorFieldText
      v-model="service"
      :file-id="fileId"
      :original="originalService"
    />
    <EditorFieldDate
      v-model="date"
      :file-id="fileId"
      :original="originalDate"
      :disabled="!service.value"
      :required="Boolean(service.value)"
    />
    <EditorFieldText
      v-model="number"
      :file-id="fileId"
      :original="originalNumber"
      :disabled="!service.value"
      :required="Boolean(service.value)"
    />
  </div>
</template>
