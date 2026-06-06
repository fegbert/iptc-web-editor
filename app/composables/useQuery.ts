import { useQuery } from '@tanstack/vue-query'

export default () => {
  const { $trpc } = useNuxtApp()

  return {
    workspace: {
      list: () => useQuery({
        queryFn: () => $trpc.workspace.list.query(),
        queryKey: ['workspace', 'list'],
        meta: { errorKey: 'listing workspaces' },
      }),
    },
  } as const
}
