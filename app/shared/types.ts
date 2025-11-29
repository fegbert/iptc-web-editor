// TODO: Improve this typing when adding full metadata mapping
export interface FileWithMetadata {
  id: string
  file: File
  handle?: FileSystemFileHandle
  metadata: Record<string, string>
  isDownloaded?: boolean
}
