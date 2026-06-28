export interface WorkspaceFileRecord {
  id: string
  r2Key: string
  metadata: Record<string, string>
  createdAt: Date
  createdBy: string
  updatedAt?: Date | null
  updatedBy?: string | null
  previewUrl: string
  fileData: {
    name: string
    type: string
    size: number
    lastModified: string
    path: string | null
  }
}

export type WorkspaceServerEvent
  = | { type: 'file:added', data: WorkspaceFileRecord }
    | { type: 'file:deleted', data: { fileId: string } }
    | { type: 'file:metadata_updated', data: { fileId: string, metadata: Record<string, string> } }
    | { type: 'proposal:fields_rejected', data: { fileId: string, fieldIds: string[] } }
    | { type: 'proposal:submitted', data: { fileId: string } }
