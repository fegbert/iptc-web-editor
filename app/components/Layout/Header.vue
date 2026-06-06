<script setup lang="ts">
const { workspace: queryWorkspace } = useQuery()

const { data: workspaces } = queryWorkspace.list()

const { $trpc, queryClient, useMutation, makeTrpcErrorToast } = useMutationHelpers()
const notification = useToast()

const create = useMutation({
  mutationFn: $trpc.workspace.create.mutate,
  onError: makeTrpcErrorToast(notification, { description: 'Failed to create workspace' }),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['workspace'] })
    notification.add({
      title: 'The Workspace has been created',
      color: 'success',
      duration: 5000,
    })
  },
})

function test() {
  create.mutate({ name: 'Test Workspace' })
}
</script>

<template>
  <div class="HeaderHeight px-16 flex justify-between items-center bg-default/75 border-default border-b">
    <div class="flex items-center gap-2">
      <Icon name="material-symbols:image-search-outline" size="24" />
      <h1 class="font-bold text-lg font-sans">
        IPTC Web Editor {{ `(${workspaces?.length ?? 0} workspaces)` }}
      </h1>
    </div>
    <div class="flex items-center gap-2">
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
      <Show when="signed-in">
        <UserButton />
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <UButton color="neutral" variant="outline" label="Sign in" />
        </SignInButton>
      </Show>
      <UButton color="neutral" variant="subtle" label="Test TRPC" @click="test" />
    </div>
  </div>
</template>

<style scoped>
.HeaderHeight {
  height: calc(0.25rem * 16);
}
</style>
