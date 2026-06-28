import type { Prisma } from '~/prisma/generated/client'

interface FileData {
  name: string
  type: string
  size: number
  lastModified: number
  path?: string | null
}
export interface FileWithMetadata {
  id: string
  buffer: ArrayBuffer
  data: FileData
  handle?: FileSystemFileHandle
  metadata: Record<string, string>
  isDownloaded?: boolean
  previewUrl?: string
  createdAt?: Date
  createdBy?: string
  updatedAt?: Date
  updatedBy?: string
}

export type Template = Prisma.TemplateGetPayload<{ include: { fields: true } }>
export type TemplateIdb = Prisma.TemplateGetPayload<{
  select: {
    id: true
    title: true
    description: true
    fields: {
      select: {
        fieldId: true
        value: true
      }
    }
  }
}>
export type TemplateCreateInput = Prisma.TemplateCreateInput & { fields: Prisma.TemplateFieldCreateInput[] }
export type TemplateIdbCreateInput = Omit<TemplateIdb, 'id'>
