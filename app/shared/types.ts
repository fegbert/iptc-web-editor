// TODO: Improve this typing when adding full metadata mapping
export interface FileWithMetadata {
  file: File
  handle?: FileSystemFileHandle
  metadata: Record<string, any>
  isSelected?: boolean
}
