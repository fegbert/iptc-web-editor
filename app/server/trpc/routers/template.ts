import { TRPCError } from '@trpc/server'
import z from 'zod'
import { createRouter } from '../init'
import { protectedProcedure } from '../procedures'

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
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const templates = await ctx.prisma.template.findMany({
        where: {
          OR: [
            { createdBy: ctx.auth.userId },
            ...(ctx.auth.orgId ? [{ sharedWithOrgIds: { has: ctx.auth.orgId } }] : []),
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
  upsert: protectedProcedure
    .input(templateUpsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, title, description, fields } = input
      const { orgId } = ctx.auth

      const upsertedTemplate = await ctx.prisma.template.upsert({
        where: { id: id ?? '' },
        update: {
          title,
          description,
          sharedWithOrgIds: { set: input.sharedWithOrgIds ?? orgId ? [orgId!] : [] },
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
          sharedWithOrgIds: orgId ? [orgId] : [],
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
  updateSharing: protectedProcedure
    .input(z.object({ id: z.string(), sharedWithOrgIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.prisma.template.findUnique({
        where: { id: input.id },
        select: { createdBy: true },
      })

      if (!template) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
      }

      if (template.createdBy !== ctx.auth.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to change sharing settings of this template' })
      }

      return ctx.prisma.template.update({
        where: { id: input.id },
        data: { sharedWithOrgIds: { set: input.sharedWithOrgIds } },
      })
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const templateToDelete = await ctx.prisma.template.findUnique({
        where: { id: input.id },
        select: { createdBy: true, sharedWithOrgIds: true },
      })

      if (!templateToDelete) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' })
      }

      if (templateToDelete?.createdBy !== ctx.auth.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete this template' })
      }

      return await ctx.prisma.template.delete({ where: { id: input.id } })
    }),
})
