<script setup lang="ts">
const props = defineProps<{
  template: {
    id: string
    sharedWithOrgIds: string[]
  }
}>()

const { template: mutationTemplate } = useMutations()
const { updateSharing } = mutationTemplate()

const { user } = useUser()
const userMemberships = computed(() => user.value?.organizationMemberships)

const isOpen = ref(false)
const selectedOrgIds = ref<string[]>(props.template.sharedWithOrgIds)

const orgs = computed(() => userMemberships.value?.map(membership => ({
  id: membership.organization.id,
  name: membership.organization.name,
})))

watch(isOpen, (open) => {
  if (open) {
    selectedOrgIds.value = [...props.template.sharedWithOrgIds]
  }
})

function toggleOrg(orgId: string) {
  const index = selectedOrgIds.value.indexOf(orgId)
  if (index === -1) {
    selectedOrgIds.value.push(orgId)
  }
  else {
    selectedOrgIds.value.splice(index, 1)
  }
}

async function save() {
  await updateSharing.mutateAsync({
    id: props.template.id,
    sharedWithOrgIds: selectedOrgIds.value,
  })

  if (updateSharing.isSuccess.value) {
    isOpen.value = false
  }
}
</script>

<template>
  <UPopover v-model:open="isOpen">
    <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-share-2" @click.stop>
      Manage Access
    </UButton>

    <template #content>
      <div class="flex flex-col gap-3 p-3 min-w-48">
        <p class="text-xs font-semibold text-muted uppercase tracking-wide">
          Share with Workspaces
        </p>

        <div v-if="orgs && orgs.length > 0" class="flex flex-col gap-2">
          <label v-for="org in orgs" :key="org.id" class="flex items-center gap-2 cursor-pointer">
            <UCheckbox :model-value="selectedOrgIds.includes(org.id)" @update:model-value="toggleOrg(org.id)" />
            <span class="text-sm">{{ org.name }}</span>
          </label>
        </div>

        <p v-else class="text-sm text-muted">
          No workspaces found.
        </p>

        <USeparator />

        <div class="flex w-full gap-2">
          <UButton class="w-full justify-center" icon="i-lucide-x" size="sm" variant="subtle" color="neutral" @click.stop="isOpen = false">
            Cancel
          </UButton>
          <UButton class="w-full justify-center" icon="i-lucide-check" size="sm" color="primary" :loading="updateSharing.isPending.value" @click.stop="save">
            Save
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
