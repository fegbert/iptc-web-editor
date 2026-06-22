const pendingFieldIds = ref<Record<string, Set<string>>>({})
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
    const state = fileStates.value[fileId]

    if (state) {
      proposal.changes.forEach(({ fieldId, newValue }) => {
        const field = state.find(field => field.key === fieldId)
        if (field) {
          field.value = newValue ?? ''
          fieldSet.add(fieldId)
        }
      })
    }

    pendingFieldIds.value[fileId] = fieldSet
    proposalIds.value[fileId] = proposal.id
  }

  function clearProposalForFile(fileId: string) {
    delete pendingFieldIds.value[fileId]
    delete proposalIds.value[fileId]
    setupFileState(fileId)
  }

  function removeProposalTracking(fileId: string) {
    delete pendingFieldIds.value[fileId]
    delete proposalIds.value[fileId]
  }

  function isPendingField(fileId: string, fieldKey: string) {
    return pendingFieldIds.value[fileId]?.has(fieldKey) ?? false
  }

  function hasPendingProposal(fileId: string) {
    const ids = pendingFieldIds.value[fileId]
    return ids !== undefined && ids.size > 0
  }

  function getProposalId(fileId: string) {
    return proposalIds.value[fileId]
  }

  return {
    loadProposalForFile,
    clearProposalForFile,
    removeProposalTracking,
    isPendingField,
    hasPendingProposal,
    getProposalId,
  }
}
