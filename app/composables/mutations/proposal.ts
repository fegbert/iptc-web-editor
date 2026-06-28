export default () => {
  const { $trpc, makeTrpcErrorToast, queryClient, useMutation } = useMutationHelpers()
  const notification = useToast()

  const approveFields = useMutation({
    mutationFn: $trpc.proposal.approveFields.mutate,
    onError: makeTrpcErrorToast(notification, { description: 'Failed to approve the selected fields.' }),
    onSuccess: async () => {
      notification.add({
        title: 'Fields approved',
        description: 'The selected proposed changes have been approved and applied to the file.',
        color: 'success',
        duration: 3000,
      })

      await queryClient.invalidateQueries({ queryKey: ['proposal'] })
    },
  })

  const rejectFields = useMutation({
    mutationFn: $trpc.proposal.rejectFields.mutate,
    onError: makeTrpcErrorToast(notification, { description: 'Failed to reject the selected fields.' }),
    onSuccess: async () => {
      notification.add({
        title: 'Fields rejected',
        description: 'The selected proposed changes have been rejected.',
        color: 'success',
        duration: 3000,
      })

      await queryClient.invalidateQueries({ queryKey: ['proposal'] })
    },
  })

  return { approveFields, rejectFields }
}
