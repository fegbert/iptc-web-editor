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
          changes: { some: { status: 'PENDING' } },
        },
        select: {
          id: true,
          changes: {
            where: {
              status: 'PENDING',
            },
            select: {
              fieldId: true,
              newValue: true,
              status: true,
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
          changes: { some: { status: 'PENDING' } },
        },
        select: { id: true },
      })

      if (existingProposal) {
        await ctx.prisma.$transaction([
          ctx.prisma.proposalChange.deleteMany({
            where: { proposalId: existingProposal.id, status: 'PENDING' },
          }),
          ctx.prisma.proposalChange.createMany({
            data: changesWithOld.map(change => ({ ...change, proposalId: existingProposal.id })),
          }),
        ])
        broadcastToOrg(ctx.auth.orgId, { type: 'proposal:submitted', data: { fileId: input.fileId } })
        return { id: existingProposal.id }
      }

      const proposal = await ctx.prisma.metadataProposal.create({
        data: {
          workspaceFileId: input.fileId,
          proposedBy: ctx.auth.userId,
          changes: { create: changesWithOld },
        },
        select: { id: true },
      })
      broadcastToOrg(ctx.auth.orgId, { type: 'proposal:submitted', data: { fileId: input.fileId } })
      return proposal
    }),

  listForOrg: makeRoleCheckedProcedure('org:admin')
    .query(async ({ ctx }) => {
      const proposals = await ctx.prisma.metadataProposal.findMany({
        where: {
          workspaceFile: { clerkOrgId: ctx.auth.orgId },
          changes: { some: { status: 'PENDING' } },
        },
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
              status: true,
              reviewNote: true,
              reviewedAt: true,
            },
          },
          workspaceFile: {
            select: {
              id: true,
              fileData: { select: { name: true } },
            },
          },
        },
        orderBy: { proposedAt: 'asc' },
      })

      const uniqueUserIds = [...new Set(proposals.map(p => p.proposedBy))]

      const userList = await ctx.clerk.users.getUserList({ userId: uniqueUserIds })
      const dataByUserId = Object.fromEntries(userList.data.map(user => ([
        user.id,
        {
          displayName: user.fullName ?? user.username ?? user.primaryEmailAddress ?? user.id,
          image: user.hasImage ? user.imageUrl : undefined,
        },
      ])))

      return proposals.map(proposal => ({
        ...proposal,
        proposedByData: dataByUserId[proposal.proposedBy] || null,
      }))
    }),
  countForOrg: makeRoleCheckedProcedure('org:admin')
    .query(async ({ ctx }) => {
      const count = await ctx.prisma.metadataProposal.count({
        where: {
          workspaceFile: { clerkOrgId: ctx.auth.orgId },
          changes: { some: { status: 'PENDING' } },
        },
      })
      return { count }
    }),
  approveFields: makeRoleCheckedProcedure('org:admin')
    .input(z.object({
      proposalId: z.string(),
      fieldIds: z.array(z.string()).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.metadataProposal.findUnique({
        where: { id: input.proposalId },
        select: {
          id: true,
          workspaceFileId: true,
          changes: {
            where: { fieldId: { in: input.fieldIds }, status: 'PENDING' },
            select: { id: true, fieldId: true, newValue: true },
          },
          workspaceFile: {
            select: { metadata: true, clerkOrgId: true },
          },
        },
      })

      if (!proposal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' })
      }

      if (proposal.workspaceFile.clerkOrgId !== ctx.auth.orgId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Proposal does not belong to your active workspace' })
      }

      if (proposal.changes.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No pending changes found for the specified fields' })
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

      const now = new Date()

      await ctx.prisma.$transaction(async (tx) => {
        await tx.workspaceFile.update({
          where: { id: proposal.workspaceFileId },
          data: { metadata, updatedBy: ctx.auth.userId },
        })

        await tx.proposalChange.updateMany({
          where: { id: { in: proposal.changes.map(c => c.id) } },
          data: { status: 'APPROVED', reviewedBy: ctx.auth.userId, reviewedAt: now },
        })

        const otherProposalIds = await tx.metadataProposal.findMany({
          where: {
            workspaceFileId: proposal.workspaceFileId,
            id: { not: proposal.id },
            changes: { some: { status: 'PENDING' } },
          },
          select: { id: true },
        }).then(results => results.map(r => r.id))

        if (otherProposalIds.length > 0) {
          await Promise.all(
            proposal.changes.map(change =>
              tx.proposalChange.updateMany({
                where: {
                  proposal: {
                    workspaceFileId: proposal.workspaceFileId,
                    id: { not: proposal.id },
                  },
                  fieldId: change.fieldId,
                  status: 'PENDING',
                },
                data: {
                  status: 'REJECTED',
                  reviewedBy: ctx.auth.userId,
                  reviewedAt: now,
                  reviewNote: 'Automatically rejected due to another proposal being approved for the same field',
                },
              }),
            ),
          )
        }

        broadcastToOrg(ctx.auth.orgId, {
          type: 'file:metadata_updated',
          data: { fileId: proposal.workspaceFileId, metadata },
        })
      })
    }),

  rejectFields: makeRoleCheckedProcedure('org:admin')
    .input(z.object({
      proposalId: z.string(),
      fieldIds: z.array(z.string()).min(1),
      reviewNote: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.metadataProposal.findUnique({
        where: { id: input.proposalId },
        select: {
          id: true,
          workspaceFileId: true,
          workspaceFile: { select: { clerkOrgId: true } },
          changes: {
            where: { fieldId: { in: input.fieldIds }, status: 'PENDING' },
            select: { id: true },
          },
        },
      })

      if (!proposal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' })
      }

      if (proposal.workspaceFile.clerkOrgId !== ctx.auth.orgId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Proposal does not belong to your active workspace' })
      }

      if (proposal.changes.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No pending changes found for the specified fields' })
      }

      await ctx.prisma.proposalChange.updateMany({
        where: { id: { in: proposal.changes.map(c => c.id) } },
        data: {
          status: 'REJECTED',
          reviewNote: input.reviewNote,
          reviewedBy: ctx.auth.userId,
          reviewedAt: new Date(),
        },
      })

      broadcastToOrg(ctx.auth.orgId, {
        type: 'proposal:fields_rejected',
        data: { fileId: proposal.workspaceFileId, fieldIds: input.fieldIds },
      })
    }),
})
