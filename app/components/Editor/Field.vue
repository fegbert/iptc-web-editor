<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

const field = defineModel<IPTCFieldWithValue>({ required: true })

const extra = defineModel<(IPTCFieldWithValue & { type: 'extra' })[]>('extra', { required: true })
</script>

<template>
  <EditorFieldDate v-if="isFieldType('date', field)" v-model="field" />
  <EditorFieldNumber v-else-if="isFieldType('number', field)" v-model="field" />
  <EditorFieldTime v-else-if="isFieldType('time', field)" v-model="field" />
  <EditorFieldSelect v-else-if="isFieldType('select', field)" v-model="field" />
  <EditorFieldObjectTypeOrAttribute v-else-if="isFieldType('object-type', field) || isFieldType('object-attribute', field)" v-model="field" />
  <EditorFieldSubject v-else-if="isFieldType('subject-reference', field)" v-model="field" />
  <EditorFieldTextArea v-else-if="isFieldType('textarea', field)" v-model="field" />
  <EditorFieldText v-else-if="isFieldType('text', field)" v-model="field" />
  <EditorFieldSlider v-else-if="isFieldType('slider', field)" v-model="field" />
  <EditorFieldLocation v-else-if="isFieldType('location', field) && extra[0] && isFieldType('extra', extra[0])" v-model:code="field" v-model:name="extra[0]" />
  <EditorFieldReference
    v-else-if="isFieldType('reference', field) && extra[0] && extra[1] && isFieldType('extra', extra[0]) && isFieldType('extra', extra[1])"
    v-model="field"
    v-model:date="extra[0]"
    v-model:number="extra[1]"
  />
</template>
