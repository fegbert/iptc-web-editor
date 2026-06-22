<script setup lang="ts">
const { $trpc } = useNuxtApp()
const { fileStates, fileChanges, getFileState } = useFileState()
const { loadedFiles } = useFiles()
const { applySubmittedChanges } = useProposal()
const notification = useToast()

const isSubmitting = ref(false)

const changedFileIds = computed(() => Object.keys(fileStates.value).filter(fileId => fileChanges(fileId) > 0))
const count = computed(() => changedFileIds.value.length)

async function submitAll() {
  if (!count.value) {
    return
  }

  isSubmitting.value = true

  const results = await Promise.allSettled(changedFileIds.value.map(async (fileId) => {
    const committed = loadedFiles.value[fileId]?.metadata ?? {}

    const changes = getFileState(fileId)
      .filter(field => (field.value || '') !== (committed[field.key] || ''))
      .map(field => ({
        fieldId: field.key,
        newValue: field.value || null,
      }))

    if (changes.length === 0) {
      return
    }

    const result = await $trpc.proposal.submit.mutate({ fileId, changes })
    applySubmittedChanges(fileId, changes, result.id)
  }))

  isSubmitting.value = false

  const succeeded = results.filter(result => result.status === 'fulfilled').length

  notification.add({
    title: succeeded === count.value
      ? `${succeeded} file${succeeded !== 1 ? 's' : ''} submitted for review.`
      : `${succeeded} of ${count.value} files submitted for review.`,
    color: succeeded === count.value ? 'success' : 'warning',
    duration: 3000,
  })
}
</script>

<template>
  <UButton
    icon="i-lucide-send-horizontal"
    :loading="isSubmitting"
    :disabled="!count"
    @click="submitAll"
  >
    Submit {{ count }} File{{ count !== 1 ? 's' : '' }} for Review
  </UButton>
</template>
