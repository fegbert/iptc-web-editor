import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { r2, r2Bucket } from '~/server/utils/r2'
import { createRouter } from '../init'
import { protectedProcedure } from '../procedures'

const UPLOAD_URL_TTL_SECONDS = 60 * 5
const DOWNLOAD_URL_TTL_SECONDS = 60 * 60

// UNUSED SO FAR - NEED TO SETUP AUTH STRUCTURE FIRST TO ENSURE PROPER ACCESS CONTROL. ALSO NEED TO CHECK SMTH LIKE RATE LIMITING TO PREVENT ABUSE CAUSE ID RATHER NOT BE IN 10k DEBT.
export const fileRouter = createRouter({
  // Returns a presigned PUT URL the client uses to upload directly to R2,
  // plus the r2Key that must be saved when creating the WorkspaceFile record.
  getUploadUrl: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      fileName: z.string(),
      contentType: z.string(),
      size: z.number().int().positive(),
    }))
    .query(async ({ input }) => {
      const ext = input.fileName.split('.').pop()

      if (!ext) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'File name must have an extension' })
      }

      const r2Key = `${input.workspaceId}/${crypto.randomUUID()}.${ext}`

      const url = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: r2Bucket,
          Key: r2Key,
          ContentType: input.contentType,
          ContentLength: input.size,
        }),
        { expiresIn: UPLOAD_URL_TTL_SECONDS },
      )

      return { url, r2Key }
    }),

  // Returns a presigned GET URL for downloading/previewing a workspace file.
  getDownloadUrl: protectedProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.prisma.workspaceFile.findUnique({
        where: { id: input.fileId },
        select: { r2Key: true, workspace: { select: { clerkOrgId: true } } },
      })

      if (!file || file.workspace.clerkOrgId !== (ctx.auth.orgId ?? '')) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' })
      }

      const url = await getSignedUrl(
        r2,
        new GetObjectCommand({ Bucket: r2Bucket, Key: file.r2Key }),
        { expiresIn: DOWNLOAD_URL_TTL_SECONDS },
      )

      return { url }
    }),

  // Deletes the R2 object and the WorkspaceFile record together.
  delete: protectedProcedure
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.prisma.workspaceFile.findUnique({
        where: { id: input.fileId },
        include: { workspace: true },
      })

      if (!file || file.workspace.clerkOrgId !== (ctx.auth.orgId ?? '')) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' })
      }

      await r2.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: file.r2Key }))

      return ctx.prisma.workspaceFile.delete({ where: { id: input.fileId } })
    }),
})
