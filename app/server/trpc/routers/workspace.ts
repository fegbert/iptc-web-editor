import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createRouter } from '../init'
import { protectedProcedure } from '../procedures'

export const workspaceRouter = createRouter({
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.workspace.findMany({
      where: { clerkOrgId: ctx.auth.orgId ?? '' },
      orderBy: { createdAt: 'desc' },
    })
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(({ ctx, input }) => {
      // TODO OBVIOUSLY
      return ctx.prisma.workspace.create({
        data: {
          name: input.name,
          clerkOrgId: '',
          createdBy: ctx.auth.userId,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      // TODO OBVIOUSLY
      const isOrgAdmin = ctx.auth.orgId === input.id && ctx.auth.orgRole === 'admin'

      if (!isOrgAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Must be an admin of the organization to delete a workspace' })
      }

      return ctx.prisma.workspace.delete({
        where: { id: input.id, clerkOrgId: ctx.auth.orgId ?? '' },
      })
    }),
})
