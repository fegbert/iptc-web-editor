import { TRPCError } from '@trpc/server'
import { t } from './init'

export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth.isAuthenticated) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      ...ctx,
      auth: {
        ...ctx.auth,
        userId: ctx.auth.userId!,
      },
    },
  })
}))
