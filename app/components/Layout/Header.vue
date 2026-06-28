<script setup lang="ts">
import type { OrganizationResource } from '@clerk/nuxt/types'

function getAfterSelectUrl(org: OrganizationResource) {
  if (!org.slug) {
    return '/'
  }
  navigateTo(`/workspace/${org.slug}`)
  return ''
}

const route = useRoute()
const { orgId, orgRole } = useAuth()
const isWorkspace = computed(() => !!orgId && route.path.startsWith('/workspace/'))

const { proposal: queryProposal } = useQuery()
const { data: proposalCount } = queryProposal.countForOrg({ enabled: computed(() => isWorkspace.value && orgRole.value === 'org:admin') })

const showReviewModal = ref(false)
</script>

<template>
  <ModalReviewOverview v-if="isWorkspace" v-model="showReviewModal" @close="showReviewModal = false" />
  <div class="HeaderHeight px-16 flex justify-between items-center bg-default/75 border-default border-b">
    <div class="flex items-center gap-2">
      <Icon name="material-symbols:image-search-outline" size="24" />
      <h1 class="font-bold text-lg font-sans">
        IPTC Web Editor
      </h1>
    </div>
    <div class="flex items-center gap-2">
      <WorkspaceConnectionStatus v-if="isWorkspace" />
      <UColorModeButton />
      <UTooltip text="Open on GitHub">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/fegbert/iptc-web-editor"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
      <hr class="border-accented border-1 h-7 rounded-full">
      <UButton v-if="orgRole === 'org:admin'" variant="ghost" icon="i-lucide-clipboard-list" @click="showReviewModal = true">
        Review Proposals ({{ proposalCount?.count ?? 0 }})
      </UButton>
      <hr class="border-accented border-1 h-7 rounded-full">
      <Show when="signed-in">
        <OrganizationSwitcher after-select-personal-url="/" :after-select-organization-url="getAfterSelectUrl" />
        <UserButton />
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <UButton color="neutral" variant="outline" label="Sign in" />
        </SignInButton>
      </Show>
    </div>
  </div>
</template>

<style scoped>
.HeaderHeight {
  height: calc(0.25rem * 16);
}
</style>
