import type { Prisma } from '~/prisma/generated/client'
import type { OrgRole } from '~/server/types'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { r2, r2Bucket } from '~/server/utils/r2'
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
    .input(z.object({ path: z.string().default('/') }))
    .query(async ({ ctx, input }) => {
      const files = await ctx.prisma.workspaceFile.findMany({
        where: {
          clerkOrgId: ctx.auth.orgId,
          path: { startsWith: input.path },
        },
        select: {
          r2Key: true,
          path: true,
        },
      })

      const filesWithUrls = await Promise.all(files.map(async (file) => {
        const url = await getSignedUrl(
          r2,
          new GetObjectCommand({ Bucket: r2Bucket, Key: file.r2Key }),
          { expiresIn: DOWNLOAD_URL_TTL_SECONDS },
        )

        return { ...file, url }
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
      path: z.string().default('/'),
      size: z.number().max(MAX_ALLOWED_FILE_SIZE, { error: `File size must be less than ${MAX_ALLOWED_FILE_SIZE / (1024 * 1024)} MB` }),
      contentType: z.enum(['image/jpeg']),
      metadata: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      const clerkOrgId = ctx.auth.orgId

      return ctx.prisma.workspaceFile.create({
        data: {
          clerkOrgId,
          name: input.name,
          r2Key: input.r2Key,
          size: input.size,
          metadata: input.metadata,
          createdBy: ctx.auth.userId,
          path: input.path,
        },
      })
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

      return ctx.prisma.workspaceFile.delete({ where: { id: input.fileId } })
    }),
})
