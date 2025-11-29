<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

defineProps<{
  fileId: string
}>()

const { getOriginal } = useFiles()

const field = defineModel<IPTCFieldWithValue>({ required: true })

const extra = defineModel<(IPTCFieldWithValue & { type: 'extra' })[]>('extra', { required: true })
</script>

<template>
  <EditorFieldDate
    v-if="isFieldType('date', field)"
    v-model="field"
    :file-id="fileId"
    :original="getOriginal(fileId, field.key)"
  />

  <EditorFieldNumber
    v-else-if="isFieldType('number', field)"
    v-model="field"
    :file-id="fileId"
    :original="getOriginal(fileId, field.key)"
  />
  <EditorFieldTime
    v-else-if="isFieldType('time', field)"
    v-model="field"
    :file-id="fileId"
    :original="getOriginal(fileId, field.key)"
  />
  <EditorFieldSelect
    v-else-if="isFieldType('select', field)"
    v-model="field"
    :file-id="fileId"
    :original="getOriginal(fileId, field.key)"
  />
  <EditorFieldObjectTypeOrAttribute
    v-else-if="isFieldType('object-type', field) || isFieldType('object-attribute', field)"
    v-model="field"
    :file-id="fileId"
    :original="getOriginal(fileId, field.key)"
  />
  <EditorFieldSubject
    v-else-if="isFieldType('subject-reference', field)"
    v-model="field"
    :file-id="fileId"
    :original="getOriginal(fileId, field.key)"
  />
  <EditorFieldTextArea
    v-else-if="isFieldType('textarea', field)"
    v-model="field"
    :file-id="fileId"
    :original="getOriginal(fileId, field.key)"
  />
  <EditorFieldText
    v-else-if="isFieldType('text', field)"
    v-model="field"
    :file-id="fileId"
    :original="getOriginal(fileId, field.key)"
  />
  <EditorFieldSlider
    v-else-if="isFieldType('slider', field)"
    v-model="field"
    :file-id="fileId"
    :original="getOriginal(fileId, field.key)"
  />
  <EditorFieldLocation
    v-else-if="isFieldType('location', field) && extra[0] && isFieldType('extra', extra[0])"
    v-model:code="field"
    v-model:name="extra[0]"
    :file-id="fileId"
    :original-code="getOriginal(fileId, field.key)"
    :original-name="getOriginal(fileId, extra[0].key)"
  />
  <EditorFieldReference
    v-else-if="isFieldType('reference', field) && extra[0] && extra[1] && isFieldType('extra', extra[0]) && isFieldType('extra', extra[1])"
    v-model="field"
    v-model:date="extra[0]"
    v-model:number="extra[1]"
    :file-id="fileId"
    :original-service="getOriginal(fileId, field.key)"
    :original-date="getOriginal(fileId, extra[0].key)"
    :original-number="getOriginal(fileId, extra[1].key)"
  />
  <EditorFieldLanguage
    v-else-if="isFieldType('language', field)"
    v-model="field"
    :file-id="fileId"
    :original="getOriginal(fileId, field.key)"
  />
</template>
