export default () => {
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

  return { create }
}
