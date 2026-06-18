export default () => {
  const { $trpc, useMutation, makeTrpcErrorToast, queryClient } = useMutationHelpers()
  const notification = useToast()

  const create = useMutation({
    mutationFn: $trpc.file.create.mutate,
    onError: makeTrpcErrorToast(notification, { description: 'Failed to create the file entry' }),
    onSuccess: () => {
      notification.add({
        title: 'File entry created',
        description: 'The file entry was successfully created in the database.',
        color: 'success',
        duration: 3000,
        icon: 'check',
      })

      queryClient.invalidateQueries({ queryKey: ['file'] })
    },
  })

  return { create }
}
