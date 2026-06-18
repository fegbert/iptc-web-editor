import type { FileWithMetadata } from '~/shared/types'
import type { WorkspaceFileRecord } from '~/shared/wsTypes'

export function workspaceFileToFileWithMetadata(file: WorkspaceFileRecord): FileWithMetadata {
  return {
    id: file.id,
    buffer: new ArrayBuffer(0), // Placeholder, actual buffer should be loaded separately
    previewUrl: file.previewUrl,
    createdAt: file.createdAt,
    createdBy: file.createdBy,
    updatedAt: file.updatedAt ?? undefined,
    updatedBy: file.updatedBy ?? undefined,
    data: {
      name: file.fileData.name,
      type: file.fileData.type,
      size: file.fileData.size,
      lastModified: Number.parseInt(file.fileData.lastModified),
      path: file.fileData.path,
    },
    metadata: file.metadata,
  }
}
