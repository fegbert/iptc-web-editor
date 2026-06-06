import process from 'node:process'
import { S3Client } from '@aws-sdk/client-s3'

const globalForR2 = globalThis as unknown as { r2: S3Client }

function createR2Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2 credentials. Set CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.')
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
}

export const r2 = globalForR2.r2 ?? createR2Client()
export const r2Bucket = process.env.R2_BUCKET_NAME ?? ''

if (process.env.NODE_ENV !== 'production') {
  globalForR2.r2 = r2
}
