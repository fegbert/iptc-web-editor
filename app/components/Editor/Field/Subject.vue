<script setup lang="ts">
import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'
import { subjectDetails, subjectMatters, subjects } from '~/utils/iptc-iim/mapping'

withDefaults(defineProps<{
  alignment?: 'horizontal' | 'vertical'
}>(), {
  alignment: 'horizontal',
})

const field = defineModel<IPTCFieldWithValue & { type: 'subject-reference' }>({ required: true })

const subjectSelectOptions = subjects.map(data => ({
  label: data.name,
  value: data.number,
}))

const selectedSubject = computed({
  get: () => {
    const subjectNumber = field.value.value?.split(':')[1]
    if (!subjectNumber) {
      return undefined
    }

    return subjectSelectOptions.find(option => option.value === subjectNumber) || { label: '', value: subjectNumber }
  },
  set: (newValue) => {
    if (!newValue) {
      field.value.value = ''
      return
    }

    field.value.value = `IPTC:${newValue.value}:000:000`
  },
})

const subjectMatterSelectOptions = computed(() => {
  if (!selectedSubject.value) {
    return []
  }

  return subjectMatters.filter(matter => matter.subject === selectedSubject.value!.value).map(data => ({
    label: data.name,
    value: data.number,
  }))
})

const selectedSubjectMatter = computed({
  get: () => {
    const subjectMatterNumber = field.value.value?.split(':')[2]
    if (!subjectMatterNumber) {
      return undefined
    }

    return subjectMatterSelectOptions.value.find(option => option.value === subjectMatterNumber) || { label: '', value: subjectMatterNumber }
  },
  set: (newValue) => {
    if (!newValue) {
      field.value.value = selectedSubject.value ? `IPTC:${selectedSubject.value.value}:000:000` : ''
      return
    }

    field.value.value = `IPTC:${selectedSubject.value!.value}:${newValue.value}:000`
  },
})

const subjectDetailSelectOptions = computed(() => {
  if (!selectedSubject.value || !selectedSubjectMatter.value) {
    return []
  }

  return subjectDetails.filter(detail =>
    detail.subject === selectedSubject.value!.value
    && detail.subjectMatter === selectedSubjectMatter.value!.value,
  ).map(data => ({
    label: data.name,
    value: data.number,
  }))
})

const selectedSubjectDetail = computed({
  get: () => {
    const subjectDetailNumber = field.value.value?.split(':')[3]
    if (!subjectDetailNumber) {
      return undefined
    }

    return subjectDetailSelectOptions.value.find(option => option.value === subjectDetailNumber) || { label: '', value: subjectDetailNumber }
  },
  set: (newValue) => {
    if (!newValue) {
      field.value.value = selectedSubject.value && selectedSubjectMatter.value
        ? `IPTC:${selectedSubject.value.value}:${selectedSubjectMatter.value.value}:000`
        : ''
      return
    }

    field.value.value = `IPTC:${selectedSubject.value!.value}:${selectedSubjectMatter.value!.value}:${newValue.value}`
  },
})

const originalSubject = computed(() => {
  const parts = field.value.original.split(':')
  const original = parts.length === 4 ? parts[1] : ''

  return original === '00' ? undefined : original
})

const originalSubjectMatter = computed(() => {
  const parts = field.value.original.split(':')
  const original = parts.length === 4 ? parts[2] : ''

  return original === '000' ? undefined : original
})

const originalSubjectDetail = computed(() => {
  const parts = field.value.original.split(':')
  const original = parts.length === 4 ? parts[3] : ''

  return original === '000' ? undefined : original
})

const hasSubjectChanged = computed(() => {
  if (!originalSubject.value && !selectedSubject.value?.value) {
    return false
  }

  return originalSubject.value !== selectedSubject.value?.value
})

const hasSubjectMatterChanged = computed(() => {
  const original = !originalSubjectMatter.value ? '000' : originalSubjectMatter.value
  const selected = !selectedSubjectMatter.value?.value ? '000' : selectedSubjectMatter.value?.value

  if (original === '000' && selected === '000') {
    return false
  }

  return hasSubjectChanged.value || original !== selected
})

const hasSubjectDetailChanged = computed(() => {
  const original = !originalSubjectDetail.value ? '000' : originalSubjectDetail.value
  const selected = !selectedSubjectDetail.value?.value ? '000' : selectedSubjectDetail.value?.value

  if (original === '000' && selected === '000') {
    return false
  }

  return hasSubjectMatterChanged.value || original !== selected
})

function resetSubject() {
  selectedSubject.value = { label: '', value: originalSubject.value ?? '' }
}

async function resetSubjectMatter() {
  resetSubject()

  // next tick to give computed time to update
  await nextTick(() => {
    selectedSubjectMatter.value = { label: '', value: originalSubjectMatter.value ?? '' }
  })
}

async function resetSubjectDetail() {
  await resetSubjectMatter()
  selectedSubjectDetail.value = { label: '', value: originalSubjectDetail.value ?? '' }
}
</script>

<template>
  <div class="flex gap-2 w-full" :class="alignment === 'vertical' ? 'flex-col' : ''">
    <BaseField v-model="field" title="Subject" :has-changed="hasSubjectChanged" @reset="resetSubject">
      <BaseSelect v-model="selectedSubject" :options="subjectSelectOptions" :has-changed="hasSubjectChanged" placeholder="Select a subject">
        <template #label>
          {{ selectedSubject?.label }}
        </template>
      </BaseSelect>
    </BaseField>
    <BaseField v-model="field" title="Subject Matter" :has-changed="hasSubjectMatterChanged" class="w-full" @reset="resetSubjectMatter">
      <BaseSelect v-model="selectedSubjectMatter" :disabled="subjectMatterSelectOptions.length === 0" :options="subjectMatterSelectOptions" :has-changed="hasSubjectMatterChanged">
        <template #label>
          {{ selectedSubjectMatter?.label }}
        </template>
        <template #placeholder>
          <div class="text-default/50">
            <span v-if="!selectedSubject">Select a subject first</span>
            <span v-else-if="subjectMatterSelectOptions.length === 0">No subject matters for this subject</span>
            <span v-else>Select a subject matter</span>
          </div>
        </template>
      </BaseSelect>
    </BaseField>
    <BaseField v-model="field" title="Subject Detail" :has-changed="hasSubjectDetailChanged" class="w-full" @reset="resetSubjectDetail">
      <BaseSelect v-model="selectedSubjectDetail" :disabled="subjectDetailSelectOptions.length === 0" :options="subjectDetailSelectOptions" :has-changed="hasSubjectDetailChanged">
        <template #label>
          {{ selectedSubjectDetail?.label }}
        </template>
        <template #placeholder>
          <div class="text-default/50">
            <span v-if="!selectedSubjectMatter">Select a subject matter first</span>
            <span v-else-if="subjectDetailSelectOptions.length < 1">No subject details for this subject matter</span>
            <span v-else>Select a subject detail</span>
          </div>
        </template>
      </BaseSelect>
    </BaseField>
  </div>
</template>
