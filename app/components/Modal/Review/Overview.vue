<script setup lang="ts">
import type { ProposalOrgListItem } from '~/server/types'

interface FieldEntry {
  proposalId: string
  proposedByData: ProposalOrgListItem['proposedByData']
  oldValue: string | null
  newValue: string | null
}

interface FileGroup {
  fileId: string
  fileName: string
  fields: {
    fieldId: string
    fieldTitle: string
    entries: FieldEntry[]
  }[]
}

const emit = defineEmits<{
  (e: 'close'): void
}>()

const open = defineModel<boolean>({ required: true })

const { proposal: queryProposal } = useQuery()
const { proposal: mutationProposal } = useMutations()

const { data: proposals, isLoading } = queryProposal.listForOrg({ enabled: open })

const { approveFields, rejectFields } = mutationProposal()

const selectedEntries = ref(new Set<string>())
const isRejectingBatch = ref(false)
const rejectNote = ref('')

const fileGroups = computed<FileGroup[]>(() => {
  if (!proposals.value) return []

  const fileMap = new Map<string, {
    fileName: string
    fieldMap: Map<string, { fieldTitle: string, entries: FieldEntry[] }>
  }>()

  for (const proposal of proposals.value) {
    const fileId = proposal.workspaceFile.id

    if (!fileMap.has(fileId)) {
      fileMap.set(fileId, {
        fileName: proposal.workspaceFile.fileData?.name ?? 'Unknown File',
        fieldMap: new Map(),
      })
    }

    const { fieldMap } = fileMap.get(fileId)!

    for (const change of proposal.changes) {
      if (change.status !== 'PENDING') continue

      if (!fieldMap.has(change.fieldId)) {
        fieldMap.set(change.fieldId, {
          fieldTitle: getFieldTitle(change.fieldId),
          entries: [],
        })
      }

      fieldMap.get(change.fieldId)!.entries.push({
        proposalId: proposal.id,
        proposedByData: proposal.proposedByData,
        oldValue: change.oldValue,
        newValue: change.newValue,
      })
    }
  }

  return [...fileMap.entries()].map(([fileId, { fileName, fieldMap }]) => ({
    fileId,
    fileName,
    fields: [...fieldMap.entries()].map(([fieldId, { fieldTitle, entries }]) => ({
      fieldId,
      fieldTitle,
      entries,
    })),
  }))
})

const totalFieldCount = computed(() => fileGroups.value.reduce((sum, file) => sum + file.fields.length, 0))

const selectionCount = computed(() => selectedEntries.value.size)

function entryKey(proposalId: string, fieldId: string) {
  return `${proposalId}::${fieldId}`
}

function isSelected(proposalId: string, fieldId: string) {
  return selectedEntries.value.has(entryKey(proposalId, fieldId))
}

function toggleEntry(proposalId: string, fieldId: string, fileId: string) {
  const key = entryKey(proposalId, fieldId)
  const next = new Set(selectedEntries.value)

  if (next.has(key)) {
    next.delete(key)
  }
  else {
    const field = fileGroups.value.find(f => f.fileId === fileId)?.fields.find(f => f.fieldId === fieldId)
    for (const entry of field?.entries ?? []) {
      if (entry.proposalId !== proposalId) next.delete(entryKey(entry.proposalId, fieldId))
    }
    next.add(key)
  }

  selectedEntries.value = next
}

function getFileSelectableEntries(file: FileGroup) {
  return file.fields.map(field => ({ proposalId: field.entries[0]!.proposalId, fieldId: field.fieldId }))
}

function isFileAllSelected(file: FileGroup) {
  return getFileSelectableEntries(file).every(({ proposalId, fieldId }) => isSelected(proposalId, fieldId))
}

function isFileIndeterminate(file: FileGroup) {
  const entries = getFileSelectableEntries(file)
  const count = entries.filter(({ proposalId, fieldId }) => isSelected(proposalId, fieldId)).length
  return count > 0 && count < entries.length
}

function toggleFileAll(file: FileGroup) {
  const next = new Set(selectedEntries.value)
  const entries = getFileSelectableEntries(file)
  if (isFileAllSelected(file)) {
    entries.forEach(({ proposalId, fieldId }) => next.delete(entryKey(proposalId, fieldId)))
  }
  else {
    entries.forEach(({ proposalId, fieldId }) => next.add(entryKey(proposalId, fieldId)))
  }
  selectedEntries.value = next
}

function groupSelectionByProposal() {
  const byProposal = new Map<string, string[]>()
  for (const key of selectedEntries.value) {
    const [proposalId, fieldId] = key.split('::') as [string, string]
    if (!byProposal.has(proposalId)) byProposal.set(proposalId, [])
    byProposal.get(proposalId)!.push(fieldId)
  }
  return byProposal
}

async function handleApproveSelected() {
  const byProposal = groupSelectionByProposal()
  await Promise.allSettled(
    [...byProposal.entries()].map(([proposalId, fieldIds]) =>
      approveFields.mutateAsync({ proposalId, fieldIds }),
    ),
  )
  selectedEntries.value = new Set()
}

async function handleRejectSelected() {
  const byProposal = groupSelectionByProposal()
  await Promise.allSettled(
    [...byProposal.entries()].map(([proposalId, fieldIds]) =>
      rejectFields.mutateAsync({ proposalId, fieldIds, reviewNote: rejectNote.value }),
    ),
  )
  selectedEntries.value = new Set()
  cancelRejectBatch()
}

function cancelRejectBatch() {
  isRejectingBatch.value = false
  rejectNote.value = ''
}
</script>

<template>
  <UModal
    :open="Boolean(open)"
    :ui="{ content: 'min-w-[60vw]' }"
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
            {{ totalFieldCount }} pending field change{{ totalFieldCount === 1 ? '' : 's' }} across {{ fileGroups.length }} file{{ fileGroups.length === 1 ? '' : 's' }}
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
          v-else-if="!fileGroups.length"
          class="px-4 py-8"
          variant="outline"
          icon="i-lucide-inbox"
          title="No pending proposals"
          description="There are currently no proposed changes waiting for review."
        />

        <template v-else>
          <div v-for="file in fileGroups" :key="file.fileId" class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-image" class="w-4 h-4 text-muted shrink-0" />
              <span class="text-sm font-semibold truncate">{{ file.fileName }}</span>
              <USeparator class="flex-1" />
              <span class="text-xs text-muted shrink-0">
                {{ file.fields.length }} field change{{ file.fields.length === 1 ? '' : 's' }}
              </span>
            </div>

            <div class="ml-2 pl-5 border-l border-default">
              <div class="rounded-md border border-default overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-accented/30 text-left">
                      <th class="TableHeading w-8">
                        <UCheckbox
                          :model-value="isFileAllSelected(file)"
                          :indeterminate="isFileIndeterminate(file)"
                          :ui="{ base: 'border border-primary/30 aria-checked:border-0' }"
                          color="success"
                          @update:model-value="toggleFileAll(file)"
                        />
                      </th>
                      <th class="TableHeading w-[17%]">
                        Field
                      </th>
                      <th class="TableHeading w-[13%]">
                        Proposed by
                      </th>
                      <th class="TableHeading w-[33%]">
                        Current
                      </th>
                      <th class="TableHeading w-[33%]">
                        Proposed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(field, fieldIndex) in file.fields" :key="field.fieldId">
                      <tr
                        v-for="(entry, entryIndex) in field.entries"
                        :key="entry.proposalId"
                        class="border-t border-default cursor-pointer hover:bg-accented/30"
                        :class="[
                          field.entries.length > 1 && isSelected(entry.proposalId, field.fieldId) ? 'bg-warning/15 hover:bg-warning/20' : '',
                          field.entries.length > 1 ? 'bg-warning/5 hover:bg-warning/10' : '',
                          isSelected(entry.proposalId, field.fieldId) ? 'bg-primary/10 hover:bg-primary/15' : '',
                        ]"
                        @click="toggleEntry(entry.proposalId, field.fieldId, file.fileId)"
                      >
                        <td class="px-3 py-2.5 align-middle">
                          <UCheckbox
                            :model-value="isSelected(entry.proposalId, field.fieldId)"
                            :ui="{ base: 'border border-primary/30 aria-checked:border-0' }"
                            color="success"
                            @click.stop
                            @update:model-value="toggleEntry(entry.proposalId, field.fieldId, file.fileId)"
                          />
                        </td>
                        <td class="px-3 py-2.5 text-xs font-medium align-middle">
                          <div v-if="entryIndex === 0" class="flex items-center gap-1.5 pt-0.5">
                            <span>{{ field.fieldTitle }}</span>
                            <UBadge
                              v-if="field.entries.length > 1"
                              size="xs"
                              color="warning"
                              variant="subtle"
                            >
                              {{ field.entries.length }}
                            </UBadge>
                          </div>
                        </td>
                        <td class="px-3 py-2.5 align-middle">
                          <span class="text-xs text-muted block truncate max-w-[9rem]">
                            {{ entry.proposedByData?.displayName ?? 'Unknown User' }}
                          </span>
                        </td>
                        <td class="px-3 py-2.5 align-top">
                          <span v-if="entry.oldValue" class="text-sm">
                            {{ entry.oldValue }}
                          </span>
                          <span v-else class="text-xs italic text-muted">
                            (empty)
                          </span>
                        </td>
                        <td class="px-3 py-2.5 align-top">
                          <span v-if="entry.newValue" class="text-sm">
                            {{ entry.newValue }}
                          </span>
                          <span v-else class="text-xs italic text-error">
                            (removed)
                          </span>
                        </td>
                      </tr>

                      <tr v-if="fieldIndex < file.fields.length - 1">
                        <td colspan="5" class="p-0">
                          <USeparator />
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-col gap-3 w-full">
        <div class="flex items-center justify-between gap-4">
          <span class="text-sm text-muted">
            {{ selectionCount }} selected / {{ totalFieldCount }} total
          </span>
          <div class="flex gap-2">
            <UPopover v-model:open="isRejectingBatch" :content="{ side: 'top' }">
              <UButton variant="subtle" color="error" icon="i-lucide-x" :disabled="!selectionCount || approveFields.isPending.value" @click="isRejectingBatch = true">
                Reject selected
              </UButton>

              <template #content>
                <div class="flex flex-col p-3 items-center gap-2 justify-center">
                  <span class="text-xs font-semibold uppercase tracking-wide text-default/50">
                    Confirm Rejection
                  </span>
                  <UTextarea
                    v-model="rejectNote"
                    placeholder="Reason for rejection (optional)..."
                    class="flex-1 text-sm"
                    :rows="3"
                    autofocus
                  />
                  <div class="flex w-full gap-1 shrink-0">
                    <UButton
                      class="w-full justify-center"
                      variant="ghost"
                      size="sm"
                      @click="cancelRejectBatch"
                    >
                      Cancel
                    </UButton>
                    <UButton
                      class="w-full justify-center"
                      variant="subtle"
                      color="error"
                      size="sm"
                      :loading="rejectFields.isPending.value"
                      @click="handleRejectSelected"
                    >
                      Reject
                    </UButton>
                  </div>
                </div>
              </template>
            </UPopover>
            <UButton
              color="success"
              icon="i-lucide-check"
              :loading="approveFields.isPending.value"
              :disabled="!selectionCount || rejectFields.isPending.value"
              @click="handleApproveSelected"
            >
              Approve selected
            </UButton>
          </div>
        </div>
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
