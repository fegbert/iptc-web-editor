export interface FileWithMetadata {
  id: string
  file: File
  handle?: FileSystemFileHandle
  metadata: Record<string, string>
  isDownloaded?: boolean
}
