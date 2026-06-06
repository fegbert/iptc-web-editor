import type { Router } from '~/server/trpc/routers/index'
import { splitLink } from '@trpc/client'
import superjson from 'superjson'
import { createTRPCNuxtClient, httpBatchLink, httpLink } from 'trpc-nuxt/client'

export default defineNuxtPlugin(() => {
  const trpc = createTRPCNuxtClient<Router>({
    links: [splitLink({
      condition(op) {
        return Boolean(op.context.skipBatch)
      },
      true: httpLink({ url: '/api/trpc', transformer: superjson }),
      false: httpBatchLink({ url: '/api/trpc', transformer: superjson }),
    })],
  })

  return {
    provide: {
      trpc,
    },
  }
})
