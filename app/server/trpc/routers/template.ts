import { TRPCError } from '@trpc/server'
import z from 'zod'
import { createRouter } from '../init'
import { hasRole, makeRoleCheckedProcedure } from '../procedures'

const templateUpsertSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  sharedWithOrgIds: z.array(z.string()).optional(),
  fields: z.array(z.object({
    id: z.string().optional(),
    fieldId: z.string(),
    value: z.string().optional(),
  })),
})

export const templateRouter = createRouter({
  list: makeRoleCheckedProcedure('org:member')
    .query(async ({ ctx }) => {
      const templates = await ctx.prisma.template.findMany({
        where: {
          OR: [
            { createdBy: ctx.auth.userId },
            { sharedWithOrgIds: { has: ctx.auth.orgId } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          createdBy: true,
          updatedAt: true,
          updatedBy: true,
          sharedWithOrgIds: true,
          fields: {
            select: {
              fieldId: true,
              value: true,
            },
          },
        },
      })

      const orderedTemplates = templates.sort((a, b) => {
        const dateA = a.updatedAt ?? a.createdAt
        const dateB = b.updatedAt ?? b.createdAt
        return dateB.getTime() - dateA.getTime()
      })

      return orderedTemplates
    }),
  upsert: makeRoleCheckedProcedure('org:member')
    .input(templateUpsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, title, description, sharedWithOrgIds, fields } = input

      const upsertedTemplate = await ctx.prisma.template.upsert({
        where: { id: id ?? '' },
        update: {
          title,
          description,
          sharedWithOrgIds,
          updatedAt: new Date(),
          updatedBy: ctx.auth.userId,
          fields: {
            deleteMany: {
              NOT: fields.filter(f => f.id).map(f => ({ id: f.id! })),
            },
            upsert: fields.map(field => ({
              where: { id: field.id ?? '' },
              update: {
                fieldId: field.fieldId,
                value: field.value,
              },
              create: {
                fieldId: field.fieldId,
                value: field.value,
              },
            })),
          },
        },
        create: {
          title,
          description,
          sharedWithOrgIds,
          createdBy: ctx.auth.userId!,
          fields: {
            create: fields.map(field => ({
              fieldId: field.fieldId,
              value: field.value,
            })),
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          createdBy: true,
          updatedAt: true,
          updatedBy: true,
          fields: {
            select: {
              fieldId: true,
              value: true,
            },
          },
        },
      })

      return upsertedTemplate
    }),

  delete: makeRoleCheckedProcedure('org:member')
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const templateToDelete = await ctx.prisma.template.findUnique({
        where: { id: input.id },
        select: { createdBy: true, sharedWithOrgIds: true },
      })

      if (!templateToDelete) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
      }

      if (!hasRole(ctx.auth.orgRole, 'org:admin') && templateToDelete?.createdBy !== ctx.auth.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this template' })
      }

      return await ctx.prisma.template.delete({ where: { id: input.id } })
    }),
})
