const pendingFieldIds = ref<Record<string, Set<string>>>({})
const pendingValues = ref<Record<string, Record<string, string>>>({})
const proposalIds = ref<Record<string, string>>({})

export default function useProposal() {
  const { $trpc } = useNuxtApp()
  const { fileStates, setupFileState } = useFileState()

  async function loadProposalForFile(fileId: string) {
    const proposal = await $trpc.proposal.getPendingProposal.query({ fileId })

    if (!proposal) {
      pendingFieldIds.value[fileId] = new Set()
      return
    }

    const fieldSet = new Set<string>()
    const values: Record<string, string> = {}
    const state = fileStates.value[fileId]

    if (state) {
      proposal.changes.forEach(({ fieldId, newValue }) => {
        const field = state.find(field => field.key === fieldId)
        if (field) {
          field.value = newValue ?? ''
          fieldSet.add(fieldId)
          values[fieldId] = newValue ?? ''
        }
      })
    }

    pendingFieldIds.value[fileId] = fieldSet
    pendingValues.value[fileId] = values
    proposalIds.value[fileId] = proposal.id
  }

  function applySubmittedChanges(fileId: string, changes: { fieldId: string, newValue: string | null }[], proposalId: string) {
    pendingFieldIds.value[fileId] = new Set(changes.map(change => change.fieldId))
    pendingValues.value[fileId] = Object.fromEntries(changes.map(change => [change.fieldId, change.newValue ?? '']))
    proposalIds.value[fileId] = proposalId
  }

  function applyMetadataUpdate(fileId: string, oldMetadata: Record<string, string>, newMetadata: Record<string, string>) {
    const state = fileStates.value[fileId]
    if (state) {
      for (const field of state) {
        const oldCommitted = oldMetadata[field.key] ?? ''
        const newCommitted = newMetadata[field.key] ?? ''
        if (oldCommitted === newCommitted) continue
        if ((field.value ?? '') === oldCommitted) {
          field.value = newCommitted
        }
      }
    }

    const ids = pendingFieldIds.value[fileId]
    if (!ids) return

    for (const fieldId of [...ids]) {
      const pendingValue = pendingValues.value[fileId]?.[fieldId] ?? ''
      if ((newMetadata[fieldId] ?? '') === pendingValue) {
        ids.delete(fieldId)
        delete pendingValues.value[fileId]?.[fieldId]
      }
    }
    if (ids.size === 0) {
      delete pendingFieldIds.value[fileId]
      delete pendingValues.value[fileId]
      delete proposalIds.value[fileId]
    }
  }

  function clearRejectedFields(fileId: string, fieldIds: string[]) {
    const ids = pendingFieldIds.value[fileId]
    if (!ids) return

    const { loadedFiles } = useFiles()
    const committed = loadedFiles.value[fileId]?.metadata ?? {}
    const state = fileStates.value[fileId]

    for (const fieldId of fieldIds) {
      ids.delete(fieldId)
      delete pendingValues.value[fileId]?.[fieldId]

      const field = state?.find(f => f.key === fieldId)
      if (field) {
        field.value = committed[fieldId] ?? ''
      }
    }

    if (ids.size === 0) {
      delete pendingFieldIds.value[fileId]
      delete pendingValues.value[fileId]
      delete proposalIds.value[fileId]
    }
  }

  function clearProposalForFile(fileId: string) {
    delete pendingFieldIds.value[fileId]
    delete pendingValues.value[fileId]
    delete proposalIds.value[fileId]
    setupFileState(fileId)
  }

  function removeProposalTracking(fileId: string) {
    delete pendingFieldIds.value[fileId]
    delete proposalIds.value[fileId]
    delete pendingValues.value[fileId]
  }

  function isPendingField(fileId: string, fieldKey: string) {
    if (!pendingFieldIds.value[fileId]?.has(fieldKey)) {
      return false
    }
    const pendingValue = pendingValues.value[fileId]?.[fieldKey] ?? ''
    const currentValue = fileStates.value[fileId]?.find(field => field.key === fieldKey)?.value ?? ''
    return pendingValue === currentValue
  }

  function hasPendingProposal(fileId: string) {
    const ids = pendingFieldIds.value[fileId]
    if (!ids || ids.size === 0) {
      return false
    }
    return [...ids].some(fieldId => isPendingField(fileId, fieldId))
  }

  function getProposalId(fileId: string) {
    return proposalIds.value[fileId]
  }

  return {
    loadProposalForFile,
    applySubmittedChanges,
    clearRejectedFields,
    clearProposalForFile,
    removeProposalTracking,
    isPendingField,
    hasPendingProposal,
    getProposalId,
    applyMetadataUpdate,
  }
}
