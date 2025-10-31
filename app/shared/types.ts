// TODO: Improve this typing when adding full metadata mapping
export interface FileWithMetadata {
  id: string
  file: File
  handle?: FileSystemFileHandle
  metadata: Record<string, any>
  isDownloaded?: boolean
  isSelected?: boolean
}

export interface Field {
  key: string
  title: string
  value?: string
}
