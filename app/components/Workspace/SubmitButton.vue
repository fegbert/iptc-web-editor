<script setup lang="ts">
const { $trpc } = useNuxtApp()
const { loadedFiles } = useFiles()
const { fileStates, getNonPendingChanges, getFileState } = useFileState()
const { queryClient } = useMutationHelpers()
const { applySubmittedChanges, isPendingField } = useProposal()
const notification = useToast()

const isSubmitting = ref(false)

const changedFileIds = computed(() => Object.keys(fileStates.value).filter(fileId => getNonPendingChanges(fileId).length > 0))
const count = computed(() => changedFileIds.value.length)

async function submitAll() {
  if (!count.value) {
    return
  }

  isSubmitting.value = true

  const currentCount = count.value

  const results = await Promise.allSettled(changedFileIds.value.map(async (fileId) => {
    const commited = loadedFiles.value[fileId]?.metadata ?? {}

    const changes = getFileState(fileId)
      .filter(field => isPendingField(fileId, field.key) || (field.value ?? '') !== (commited[field.key] ?? ''))
      .map(field => ({
        fieldId: field.key,
        newValue: field.value ?? null,
      }))

    if (changes.length === 0) {
      return
    }

    const result = await $trpc.proposal.submit.mutate({ fileId, changes })
    await queryClient.invalidateQueries({ queryKey: ['proposal', 'listForOrg'] })
    applySubmittedChanges(fileId, changes, result.id)
  }))

  isSubmitting.value = false

  const succeeded = results.filter(result => result.status === 'fulfilled').length

  notification.add({
    title: succeeded === currentCount
      ? `${succeeded} file${succeeded !== 1 ? 's' : ''} submitted for review.`
      : `${succeeded} of ${currentCount} files submitted for review.`,
    color: succeeded === currentCount ? 'success' : 'warning',
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
