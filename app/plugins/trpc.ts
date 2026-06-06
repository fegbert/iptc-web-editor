import type { Router } from '~/server/trpc/routers/index'
import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'

export default defineNuxtPlugin(() => {
  const trpc = createTRPCNuxtClient<Router>({
    links: [
      httpBatchLink({
        url: '/api/trpc',
      }),
    ],
  })

  return {
    provide: {
      trpc,
    },
  }
})
