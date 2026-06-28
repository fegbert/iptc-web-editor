import type { FileGetUploadUrlInput } from '~/server/types'
import { useQuery } from '@tanstack/vue-query'

export default () => {
  const { $trpc } = useNuxtApp()
  const { orgId } = useAuth()
  const route = useRoute()

  return {
    file: {
      list: (path?: string) => useQuery({
        queryFn: () => $trpc.file.list.query({ path }),
        queryKey: ['file', 'list', route.params.orgId],
        meta: { errorKey: 'listing files', path, orgId },
      }),
      getUploadUrl: (input: FileGetUploadUrlInput) => useQuery({
        queryFn: () => $trpc.file.getUploadUrl.query(input),
        queryKey: ['file', 'getUploadUrl', input],
        meta: { errorKey: 'getting upload url', orgId },
      }),
    },
    template: {
      list: (input: { enabled?: Ref<boolean> }) => useQuery({
        queryFn: () => $trpc.template.list.query(),
        queryKey: ['template', 'list', route.params.orgId],
        meta: { errorKey: 'listing templates', orgId },
        enabled: input.enabled,
      }),
    },
    proposal: {
      listForOrg: (input: { enabled?: Ref<boolean> }) => useQuery({
        queryFn: () => $trpc.proposal.listForOrg.query(),
        queryKey: ['proposal', 'listForOrg', route.params.orgId],
        meta: { errorKey: 'listing proposals for org', orgId },
        enabled: input.enabled,
      }),
      countForOrg: (input: { enabled?: Ref<boolean> }) => useQuery({
        queryFn: () => $trpc.proposal.countForOrg.query(),
        queryKey: ['proposal', 'countForOrg', route.params.orgId],
        meta: { errorKey: 'counting proposals for org', orgId },
        enabled: input.enabled,
      }),
    },
  } as const
}
