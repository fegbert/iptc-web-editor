<script setup lang="ts">
import { subjectDetails, subjectMatters, subjects } from '~/utils/iptc-iim/mapping'

defineProps<{
  required?: boolean
}>()

const value = defineModel<string>()

const subjectSelectOptions = subjects.map(data => ({
  label: data.name,
  value: data.number,
}))

const selectedSubject = computed({
  get: () => {
    const subjectNumber = value.value?.split(':')[1]
    return subjectSelectOptions.find(option => option.value === subjectNumber)
  },
  set: (newValue) => {
    if (!newValue) {
      value.value = ''
      return
    }

    value.value = `IPTC:${newValue.value}:000:000`
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
    const subjectMatterNumber = value.value?.split(':')[2]
    return subjectMatterSelectOptions.value.find(option => option.value === subjectMatterNumber)
  },
  set: (newValue) => {
    if (!newValue) {
      value.value = selectedSubject.value ? `IPTC:${selectedSubject.value.value}:000:000` : ''
      return
    }

    value.value = `IPTC:${selectedSubject.value!.value}:${newValue.value}:000`
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
    const subjectDetailNumber = value.value?.split(':')[3]
    return subjectDetailSelectOptions.value.find(option => option.value === subjectDetailNumber)
  },
  set: (newValue) => {
    if (!newValue) {
      value.value = selectedSubject.value && selectedSubjectMatter.value
        ? `IPTC:${selectedSubject.value.value}:${selectedSubjectMatter.value.value}:000`
        : ''
      return
    }

    value.value = `IPTC:${selectedSubject.value!.value}:${selectedSubjectMatter.value!.value}:${newValue.value}`
  },
})
</script>

<template>
  <div>
    <UFormField name="subject" label="Subject" :required="required" class="w-full">
      <BaseSelect v-model="selectedSubject" :options="subjectSelectOptions" placeholder="Select a subject">
        <template #label>
          {{ selectedSubject?.label }}
        </template>
      </BaseSelect>
    </UFormField>
    <UFormField name="subjectMatter" label="Subject Matter" :required="required" class="w-full">
      <BaseSelect v-model="selectedSubjectMatter" :disabled="subjectMatterSelectOptions.length < 1" :options="subjectMatterSelectOptions">
        <template #label>
          {{ selectedSubjectMatter?.label }}
        </template>
        <template #placeholder>
          <div class="text-default/50">
            <span v-if="!selectedSubject">Select a subject first</span>
            <span v-else-if="subjectMatterSelectOptions.length < 1">No subject matters for this subject</span>
            <span v-else>Select a subject matter</span>
          </div>
        </template>
      </BaseSelect>
    </UFormField>
    <UFormField name="subjectDetail" label="Subject Detail" :required="required" class="w-full">
      <BaseSelect v-model="selectedSubjectDetail" :disabled="subjectDetailSelectOptions.length < 1" :options="subjectDetailSelectOptions">
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
    </UFormField>
  </div>
</template>
