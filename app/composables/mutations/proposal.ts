export default () => {
  const { $trpc, makeTrpcErrorToast, queryClient, useMutation } = useMutationHelpers()
  const notification = useToast()

  const approve = useMutation({
    mutationFn: $trpc.proposal.approve.mutate,
    onError: makeTrpcErrorToast(notification, { description: 'Failed to approve the proposal.' }),
    onSuccess: () => {
      notification.add({
        title: 'Proposal approved',
        description: 'The proposed changes have been approved.',
        color: 'success',
        duration: 3000,
      })

      queryClient.invalidateQueries({ queryKey: ['proposal'] })
    },
  })

  const reject = useMutation({
    mutationFn: $trpc.proposal.reject.mutate,
    onError: makeTrpcErrorToast(notification, { description: 'Failed to reject the proposal.' }),
    onSuccess: () => {
      notification.add({
        title: 'Proposal rejected',
        description: 'The proposed changes have been rejected.',
        color: 'error',
        duration: 3000,
      })

      queryClient.invalidateQueries({ queryKey: ['proposal'] })
    },
  })

  return { approve, reject }
}
