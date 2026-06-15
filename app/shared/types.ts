// TODO: Improve this typing when adding full metadata mapping

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
