import type { Prisma } from '~/prisma/generated/client'
import type { OrgRole } from '~/server/types'
import type { WorkspaceFileRecord } from '~/shared/wsTypes'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { r2, r2Bucket } from '~/server/utils/r2'
import { broadcastToOrg } from '~/server/utils/wsOrg'
import { createRouter } from '../init'
import { hasRole, makeRoleCheckedProcedure } from '../procedures'

const UPLOAD_URL_TTL_SECONDS = 5 * 60
const DOWNLOAD_URL_TTL_SECONDS = 60 * 60

const MAX_ALLOWED_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function checkFilePermissions(file: Prisma.WorkspaceFileGetPayload<{ select: { clerkOrgId: true, createdBy: true } }>, userId: OrgRole, orgId: string) {
  if (file.clerkOrgId !== orgId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'The file does not belong to your organization' })
  }

  const isAdminOrCreator = hasRole(userId, 'org:admin') || file.createdBy === userId

  if (!isAdminOrCreator) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to access this file' })
  }
}

// TODO: Definitely still look into rate limiting
export const fileRouter = createRouter({
  list: makeRoleCheckedProcedure('org:viewer')
    .input(z.object({ path: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const files = await ctx.prisma.workspaceFile.findMany({
        where: {
          clerkOrgId: ctx.auth.orgId,
          fileData: {
            path: { startsWith: input.path },
          },
        },
        select: {
          id: true,
          r2Key: true,
          metadata: true,
          createdAt: true,
          createdBy: true,
          updatedAt: true,
          updatedBy: true,
          fileData: {
            select: {
              name: true,
              type: true,
              size: true,
              lastModified: true,
              path: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const filesWithUrls: WorkspaceFileRecord[] = await Promise.all(files.map(async (file) => {
        const url = await getSignedUrl(
          r2,
          new GetObjectCommand({ Bucket: r2Bucket, Key: file.r2Key }),
          { expiresIn: DOWNLOAD_URL_TTL_SECONDS },
        )

        if (!file.fileData) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'File data is missing' })
        }

        return {
          ...file,
          fileData: file.fileData!, // checked that its not null above, safe to assert
          previewUrl: url,
          metadata: file.metadata as Record<string, string>,
        }
      }))

      return filesWithUrls
    }),
  getUploadUrl: makeRoleCheckedProcedure('org:member')
    .input(z.object({
      filename: z.string().max(255),
      contentType: z.enum(['image/jpeg']),
      size: z.number().max(MAX_ALLOWED_FILE_SIZE, { error: `File size must be less than ${MAX_ALLOWED_FILE_SIZE / (1024 * 1024)} MB` }),
    }))
    .query(async ({ input, ctx }) => {
      const ext = input.filename.split('.').pop()

      if (!ext) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Filename must have an extension' })
      }

      const clerkOrgId = ctx.auth.orgId
      const r2Key = `${clerkOrgId}/${crypto.randomUUID()}.${ext}`

      const uploadUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: r2Bucket,
          Key: r2Key,
          ContentType: input.contentType,
          ContentLength: input.size,
        }),
        { expiresIn: UPLOAD_URL_TTL_SECONDS },
      )

      return { uploadUrl, r2Key }
    }),
  create: makeRoleCheckedProcedure('org:member')
    .input(z.object({
      r2Key: z.string(),
      name: z.string().max(255),
      path: z.string().optional(),
      size: z.number().max(MAX_ALLOWED_FILE_SIZE, { error: `File size must be less than ${MAX_ALLOWED_FILE_SIZE / (1024 * 1024)} MB` }),
      lastModified: z.string().refine(date => !Number.isNaN(date), { message: 'Invalid date format for lastModified' }),
      contentType: z.enum(['image/jpeg']),
      metadata: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      const clerkOrgId = ctx.auth.orgId

      const workspaceFile = await ctx.prisma.workspaceFile.create({
        data: {
          clerkOrgId,
          r2Key: input.r2Key,
          metadata: input.metadata,
          createdBy: ctx.auth.userId,
          fileData: {
            create: {
              name: input.name,
              type: input.contentType,
              size: input.size,
              lastModified: input.lastModified,
              path: input.path,
            },
          },
        },
      })

      const previewUrl = await getSignedUrl(
        r2,
        new GetObjectCommand({ Bucket: r2Bucket, Key: workspaceFile.r2Key }),
        { expiresIn: DOWNLOAD_URL_TTL_SECONDS },
      )

      broadcastToOrg(clerkOrgId, {
        type: 'file:added',
        data: {
          id: workspaceFile.id,
          r2Key: workspaceFile.r2Key,
          metadata: workspaceFile.metadata as Record<string, string>,
          createdAt: workspaceFile.createdAt,
          createdBy: workspaceFile.createdBy,
          updatedAt: workspaceFile.updatedAt,
          updatedBy: workspaceFile.updatedBy,
          previewUrl,
          fileData: {
            name: input.name,
            type: input.contentType,
            size: input.size,
            lastModified: input.lastModified,
            path: input.path ?? null,
          },
        },
      })

      return workspaceFile
    }),
  delete: makeRoleCheckedProcedure('org:member')
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.prisma.workspaceFile.findUnique({
        where: { id: input.fileId },
        select: { r2Key: true, clerkOrgId: true, createdBy: true },
      })

      if (!file) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' })
      }

      checkFilePermissions(file, ctx.auth.orgRole, ctx.auth.orgId)

      await r2.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: file.r2Key }))

      await ctx.prisma.workspaceFile.delete({ where: { id: input.fileId } })

      broadcastToOrg(ctx.auth.orgId, {
        type: 'file:deleted',
        data: { fileId: input.fileId },
      })
    }),
  updateMetadata: makeRoleCheckedProcedure('org:member')
    .input(z.object({
      fileId: z.string(),
      metadata: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.prisma.workspaceFile.findUnique({
        where: { id: input.fileId },
        select: { clerkOrgId: true, createdBy: true },
      })

      if (!file) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' })
      }

      checkFilePermissions(file, ctx.auth.orgRole, ctx.auth.orgId)

      const updatedFile = await ctx.prisma.workspaceFile.update({
        where: { id: input.fileId },
        data: {
          metadata: input.metadata,
          updatedBy: ctx.auth.userId,
        },
      })

      broadcastToOrg(ctx.auth.orgId, {
        type: 'file:metadata_updated',
        data: {
          fileId: updatedFile.id,
          metadata: updatedFile.metadata as Record<string, string>,
        },
      })

      return updatedFile
    }),
})
