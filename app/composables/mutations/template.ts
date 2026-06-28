export default () => {
  const { $trpc, useMutation, makeTrpcErrorToast, queryClient } = useMutationHelpers()
  const notification = useToast()

  const updateSharing = useMutation({
    mutationFn: $trpc.template.updateSharing.mutate,
    onError: makeTrpcErrorToast(notification, { description: 'Failed to update template sharing settings' }),
    onSuccess: () => {
      notification.add({
        title: 'Template sharing updated',
        description: 'The template sharing settings were successfully updated.',
        color: 'success',
        duration: 3000,
        icon: 'check',
      })

      queryClient.invalidateQueries({ queryKey: ['template'] })
    },
  })

  const upsert = useMutation({
    mutationFn: $trpc.template.upsert.mutate,
    onError: makeTrpcErrorToast(notification, { description: 'Failed to save the template to the workspace' }),
    onSuccess: () => {
      notification.add({
        title: 'Template saved',
        description: 'The template was successfully saved to the workspace.',
        color: 'success',
        duration: 3000,
        icon: 'check',
      })

      queryClient.invalidateQueries({ queryKey: ['template'] })
    },
  })

  const deleteTemplate = useMutation({
    mutationFn: $trpc.template.delete.mutate,
    onError: makeTrpcErrorToast(notification, { description: 'Failed to delete the template' }),
    onSuccess: () => {
      notification.add({
        title: 'Template deleted',
        description: 'The template was successfully deleted.',
        color: 'success',
        duration: 3000,
        icon: 'check',
      })

      queryClient.invalidateQueries({ queryKey: ['template'] })
    },
  })

  return { updateSharing, upsert, deleteTemplate }
}
