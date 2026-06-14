import type { FileGetUploadUrlInput } from '~/server/types'
import { useQuery } from '@tanstack/vue-query'

export default () => {
  const { $trpc } = useNuxtApp()
  const { orgId } = useAuth()

  return {
    file: {
      list: (path?: string) => useQuery({
        queryFn: () => $trpc.file.list.query({ path }),
        queryKey: ['file', 'list'],
        meta: { errorKey: 'listing files', path, orgId },
      }),
      getUploadUrl: (input: FileGetUploadUrlInput) => useQuery({
        queryFn: () => $trpc.file.getUploadUrl.query(input),
        queryKey: ['file', 'getUploadUrl', input],
        meta: { errorKey: 'getting upload url', orgId },
      }),
    },
  } as const
}
