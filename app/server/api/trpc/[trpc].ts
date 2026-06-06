import { createTRPCNuxtHandler } from 'trpc-nuxt/server'
import { createTRPCContext } from '~/server/trpc/context'
import { appRouter } from '~/server/trpc/routers/_app'

export default createTRPCNuxtHandler({
  router: appRouter,
  createContext: createTRPCContext,
})
