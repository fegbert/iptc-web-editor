import { TRPCError } from '@trpc/server'
import z from 'zod'
import { createRouter } from '../init'
import { makeRoleCheckedProcedure } from '../procedures'

export const proposalRouter = createRouter({
  getPendingProposal: makeRoleCheckedProcedure('org:member')
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) =>
      ctx.prisma.metadataProposal.findFirst({
        where: {
          workspaceFileId: input.fileId,
          proposedBy: ctx.auth.userId,
          status: 'PENDING',
        },
        select: {
          id: true,
          changes: {
            select: {
              fieldId: true,
              newValue: true,
            },
          },
        },
      }),
    ),

  submit: makeRoleCheckedProcedure('org:member')
    .input(z.object({
      fileId: z.string(),
      changes: z.array(z.object({
        fieldId: z.string(),
        newValue: z.string().nullable(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.prisma.workspaceFile.findUnique({
        where: { id: input.fileId },
        select: { metadata: true, clerkOrgId: true },
      })

      if (!file) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' })
      }

      if (file.clerkOrgId !== ctx.auth.orgId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'File does not belong to your active workspace' })
      }

      const committed = file.metadata as Record<string, string>
      const changesWithOld = input.changes.map(change => ({
        fieldId: change.fieldId,
        oldValue: committed[change.fieldId] ?? null,
        newValue: change.newValue,
      }))

      const existingProposal = await ctx.prisma.metadataProposal.findFirst({
        where: {
          workspaceFileId: input.fileId,
          proposedBy: ctx.auth.userId,
          status: 'PENDING',
        },
        select: { id: true },
      })

      if (existingProposal) {
        await ctx.prisma.$transaction([
          ctx.prisma.proposalChange.deleteMany({ where: { proposalId: existingProposal.id } }),
          ctx.prisma.proposalChange.createMany({
            data: changesWithOld.map(change => ({ ...change, proposalId: existingProposal.id })),
          }),
        ])
        return { id: existingProposal.id }
      }

      return ctx.prisma.metadataProposal.create({
        data: {
          workspaceFileId: input.fileId,
          proposedBy: ctx.auth.userId,
          changes: { create: changesWithOld },
        },
        select: { id: true },
      })
    }),

  listForFile: makeRoleCheckedProcedure('org:member')
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.prisma.workspaceFile.findUnique({
        where: { id: input.fileId },
        select: { clerkOrgId: true },
      })

      if (!file) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' })
      }

      if (file.clerkOrgId !== ctx.auth.orgId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'File does not belong to your active workspace' })
      }

      return ctx.prisma.metadataProposal.findMany({
        where: { workspaceFileId: input.fileId, status: 'PENDING' },
        select: {
          id: true,
          proposedBy: true,
          proposedAt: true,
          updatedAt: true,
          changes: {
            select: {
              fieldId: true,
              oldValue: true,
              newValue: true,
            },
          },
        },
        orderBy: { proposedAt: 'asc' },
      })
    }),

  approve: makeRoleCheckedProcedure('org:admin')
    .input(z.object({ proposalId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.metadataProposal.findUnique({
        where: { id: input.proposalId },
        select: {
          id: true,
          status: true,
          workspaceFileId: true,
          changes: {
            select: {
              fieldId: true,
              newValue: true,
            },
          },
          workspaceFile: {
            select: {
              metadata: true,
              clerkOrgId: true,
            },
          },
        },
      })

      if (!proposal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' })
      }

      if (proposal.workspaceFile.clerkOrgId !== ctx.auth.orgId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Proposal does not belong to your active workspace' })
      }

      if (proposal.status !== 'PENDING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Only pending proposals can be approved' })
      }

      const metadata = { ...(proposal.workspaceFile.metadata as Record<string, string>) }

      for (const change of proposal.changes) {
        if (change.newValue === null) {
          delete metadata[change.fieldId]
        }
        else {
          metadata[change.fieldId] = change.newValue
        }
      }

      await ctx.prisma.$transaction([
        ctx.prisma.workspaceFile.update({
          where: { id: proposal.workspaceFileId },
          data: { metadata, updatedBy: ctx.auth.userId },
        }),
        ctx.prisma.metadataProposal.update({
          where: { id: proposal.id },
          data: {
            status: 'APPROVED',
            reviewedBy: ctx.auth.userId,
            reviewedAt: new Date(),
          },
        }),
      ])

      broadcastToOrg(ctx.auth.orgId, {
        type: 'file:metadata_updated',
        data: { fileId: proposal.workspaceFileId, metadata },
      })
    }),

  reject: makeRoleCheckedProcedure('org:admin')
    .input(z.object({ proposalId: z.string(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.metadataProposal.findUnique({
        where: { id: input.proposalId },
        select: {
          id: true,
          status: true,
          workspaceFileId: true,
          workspaceFile: {
            select: { clerkOrgId: true },
          },
        },
      })

      if (!proposal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' })
      }

      if (proposal.workspaceFile.clerkOrgId !== ctx.auth.orgId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Proposal does not belong to your active workspace' })
      }

      if (proposal.status !== 'PENDING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Only pending proposals can be rejected' })
      }

      await ctx.prisma.metadataProposal.update({
        where: { id: proposal.id },
        data: {
          status: 'REJECTED',
          reviewedBy: ctx.auth.userId,
          reviewedAt: new Date(),
          reviewNote: input.note,
        },
      })
    }),
})
