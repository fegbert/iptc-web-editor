import type { Prisma } from '~/prisma/generated/client'
import type { OrgRole } from '~/server/types'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { r2, r2Bucket } from '~/server/utils/r2'
import { createRouter } from '../init'
import { hasRole, makeRoleCheckedProcedure } from '../procedures'

const DOWNLOAD_URL_TTL_SECONDS = 60 * 60

const MAX_ALLOWED_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function checkFilePermissions(file: Prisma.WorkspaceFileGetPayload<{ select: { clerkOrgId: true, createdBy: true } }>, userId: OrgRole, orgId: string) {
  if (file.clerkOrgId !== orgId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'The file does not belong to your organization' })
  }

  const isAdminOrCreator = hasRole(userId, 'admin') || file.createdBy === userId

  if (!isAdminOrCreator) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to access this file' })
  }
}

// TODO: Definitely still look into rate limiting
export const fileRouter = createRouter({
  getAll: makeRoleCheckedProcedure('viewer')
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
  upload: makeRoleCheckedProcedure('member')
    .input(z.object({
      file: z.file().max(MAX_ALLOWED_FILE_SIZE, { error: `File size must be less than ${MAX_ALLOWED_FILE_SIZE / (1024 * 1024)} MB` }).mime('image/jpeg'),
      path: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const ext = input.file.name.split('.').pop()

      if (!ext) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'File name must have an extension' })
      }

      const clerkOrgId = ctx.auth.orgId
      const r2Key = `${clerkOrgId}/${crypto.randomUUID()}.${ext}`

      const uploadResult = await r2.send(new PutObjectCommand({
        Bucket: r2Bucket,
        Key: r2Key,
        Body: input.file,
        ContentType: input.file.type,
        ContentLength: input.file.size,
      }))

      if (uploadResult.$metadata.httpStatusCode !== 200) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload file to storage' })
      }

      const fileRecord = await ctx.prisma.workspaceFile.create({
        data: {
          clerkOrgId,
          name: input.file.name,
          r2Key,
          size: input.file.size,
          createdBy: ctx.auth.userId,
          path: input.path,
        },
      })

      return fileRecord
    }),
  delete: makeRoleCheckedProcedure('member')
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
