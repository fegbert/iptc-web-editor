import { createTRPCNuxtHandler } from 'trpc-nuxt/server'
import { createTRPCContext } from '~/server/trpc/context'
import { router } from '~/server/trpc/routers/index'

export default createTRPCNuxtHandler({
  router,
  createContext: createTRPCContext,
})
