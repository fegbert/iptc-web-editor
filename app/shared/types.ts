// TODO: Improve this typing when adding full metadata mapping
export interface FileWithMetadata {
  id: string
  file: File
  handle?: FileSystemFileHandle
  metadata: Record<string, any>
  isSelected?: boolean
}

export interface Field {
  key: string
  title: string
  value?: string
}
