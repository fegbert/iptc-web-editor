<script setup lang="ts">
import type { ProposalOrgListItem } from '~/server/types'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const open = defineModel<boolean>({ required: true })

const { proposal: queryProposal } = useQuery()
const { proposal: mutationProposal } = useMutations()

const { data: proposals, isLoading } = queryProposal.listForOrg({ enabled: open })

const { approve, reject } = mutationProposal()

const rejectingId = ref<string | null>(null)
const rejectNote = ref('')

const groupedByFile = computed(() => {
  if (!proposals.value) return []

  const map = new Map<string, { fileId: string, fileName: string, proposals: ProposalOrgListItem[] }>()

  for (const proposal of proposals.value) {
    const fileId = proposal.workspaceFile.id
    if (!map.has(fileId)) {
      map.set(fileId, {
        fileId,
        fileName: proposal.workspaceFile.fileData?.name ?? 'Unknown File',
        proposals: [],
      })
    }
    map.get(fileId)!.proposals.push(proposal)
  }

  return Array.from(map.values())
})

const totalCount = computed(() => proposals.value?.length ?? 0)

function startRejecting(proposalId: string) {
  rejectingId.value = proposalId
  rejectNote.value = ''
}

function cancelRejecting() {
  rejectingId.value = null
  rejectNote.value = ''
}

async function handleApprove(proposalId: string) {
  await approve.mutateAsync({ proposalId })
}

async function handleReject(proposalId: string) {
  await reject.mutateAsync({ proposalId, note: rejectNote.value })
  cancelRejecting()
}
</script>

<template>
  <UModal
    :open="Boolean(open)"
    :ui="{ content: 'min-w-[50vw]' }"
    @update:open="(value) => !value ? emit('close') : undefined"
  >
    <template #header>
      <div class="flex justify-between w-full items-center">
        <div>
          <p class="font-semibold text-highlighted">
            Pending Proposals
          </p>
          <USkeleton v-if="isLoading" class="h-4 w-full rounded-full" />
          <p v-else class="text-sm text-muted">
            {{ totalCount }} pending proposal{{ totalCount === 1 ? '' : 's' }} across {{ groupedByFile.length }} file{{ groupedByFile.length === 1 ? '' : 's' }}
          </p>
        </div>
        <UButton variant="ghost" color="neutral" icon="i-lucide-x" @click="emit('close')" />
      </div>
    </template>

    <template #close />

    <template #body>
      <div class="flex flex-col gap-4 py-2">
        <USkeleton v-if="isLoading" class="h-48 w-full" />

        <UEmpty
          v-else-if="!totalCount"
          class="px-4 py-8"
          variant="outline"
          icon="i-lucide-inbox"
          title="No pending proposals"
          description="There are currently no proposed changes waiting for review."
        />

        <template v-else>
          <div v-for="file in groupedByFile" :key="file.fileId" class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-image" class="w-4 h-4 text-muted shrink-0" />
              <span class="text-sm font-semibold truncate">
                {{ file.fileName }}
              </span>
              <USeparator class="flex-1" />
              <span class="text-xs text-muted shrink-0">
                {{ file.proposals.length }} proposal{{ file.proposals.length === 1 ? '' : 's' }}
              </span>
            </div>

            <div v-for="proposal in file.proposals" :key="proposal.id" class="flex flex-col gap-3 rounded-lg border p-4 ml-7">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <NuxtImg
                    v-if="proposal.proposedByData?.image"
                    :src="proposal.proposedByData.image"
                    class="w-4 h-4 rounded-full shrink-0"
                  />
                  <UIcon v-else name="i-lucide-user" class="w-3.5 h-3.5 text-muted shrink-0" />
                  <span class="text-sm font-mono truncate">{{ proposal.proposedByData?.displayName ?? proposal.proposedBy }}</span>
                  <USeparator orientation="vertical" class="h-4 shrink-0" />
                  <span class="text-xs text-muted shrink-0">
                    {{ formatDate(proposal.updatedAt ?? proposal.proposedAt) }}
                  </span>
                </div>
                <UBadge color="warning" variant="subtle" size="sm">
                  {{ proposal.changes.length }} field{{ proposal.changes.length === 1 ? '' : 's' }}
                </UBadge>
              </div>

              <div class="rounded-md border overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-accented/30">
                      <th class="TableHeading w-1/4 shrink-0">
                        Field
                      </th>
                      <th class="TableHeading w-1/2">
                        Current
                      </th>
                      <th class="TableHeading w-1/2">
                        Proposed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="change in proposal.changes" :key="change.fieldId" class="border-t">
                      <td class="px-3 py-2 text-xs font-medium text-muted">
                        {{ getFieldTitle(change.fieldId) }}
                      </td>
                      <td class="px-3 py-2">
                        <BaseDiff
                          v-if="change.oldValue && change.newValue"
                          :old-text="change.oldValue"
                          :new-text="change.newValue"
                          mode="old"
                        />
                        <span v-else-if="change.oldValue" class="text-sm">{{ change.oldValue }}</span>
                        <span v-else class="text-xs text-muted italic">Empty</span>
                      </td>
                      <td class="px-3 py-2">
                        <BaseDiff
                          v-if="change.oldValue && change.newValue"
                          :old-text="change.oldValue"
                          :new-text="change.newValue"
                          mode="new"
                        />
                        <span v-else-if="change.newValue" class="text-sm">{{ change.newValue }}</span>
                        <span v-else class="text-xs text-error italic">Removed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="rejectingId === proposal.id" class="flex flex-col gap-2">
                <UTextarea
                  v-model="rejectNote"
                  placeholder="Optional: provide a reason for rejection..."
                  :rows="2"
                  autofocus
                />
                <div class="flex gap-2 justify-end">
                  <UButton variant="ghost" color="neutral" size="sm" @click="cancelRejecting">
                    Cancel
                  </UButton>
                  <UButton color="error" size="sm" :loading="reject.isPending.value" @click="handleReject(proposal.id)">
                    Confirm Rejection
                  </UButton>
                </div>
              </div>

              <div v-else class="flex gap-2 justify-end">
                <UButton variant="subtle" color="error" size="sm" icon="i-lucide-x" @click="startRejecting(proposal.id)">
                  Reject
                </UButton>
                <UButton color="success" size="sm" icon="i-lucide-check" :loading="approve.isPending.value" @click="handleApprove(proposal.id)">
                  Approve
                </UButton>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.TableHeading {
  @apply px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wide;
}
</style>
