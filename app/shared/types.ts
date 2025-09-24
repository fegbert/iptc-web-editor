import type { FileWithHandle } from 'browser-fs-access'

// TODO: Improve this typing when adding full metadata mapping
export interface FileWithMetadata {
  file: FileWithHandle
  metadata: Record<string, any>
}
