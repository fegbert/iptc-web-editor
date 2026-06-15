import type { WorkspaceFileRecord, WorkspaceServerEvent } from '~/shared/wsTypes'

const files = ref<WorkspaceFileRecord[]>([])
const isConnected = ref(false)

let ws: WebSocket | null = null

export default function useWorkspaceSync() {
  function initFiles(initialFiles: WorkspaceFileRecord[]) {
    files.value = initialFiles
  }

  function connect(orgId: string) {
    if (ws) {
      disconnect()
    }

    ws = new WebSocket(`/ws/workspace/${orgId}`)

    ws.onopen = () => {
      isConnected.value = true
    }

    ws.onmessage = (event) => {
      handleMessage(JSON.parse(event.data) as WorkspaceServerEvent)
    }

    ws.onclose = () => {
      isConnected.value = false
    }
  }

  function disconnect() {
    ws?.close()
    ws = null
    files.value = []
    isConnected.value = false
  }

  function handleMessage(message: WorkspaceServerEvent) {
    switch (message.type) {
      case 'file:added':
        if (!files.value.find(f => f.id === message.data.id)) {
          files.value.unshift(message.data)
        }
        break
      case 'file:deleted':
        files.value = files.value.filter(f => f.id !== message.data.fileId)
        break
      case 'file:metadata_updated': {
        const file = files.value.find(f => f.id === message.data.fileId)
        if (file) {
          file.metadata = message.data.metadata
        }
        break
      }
    }
  }

  return { files, isConnected, initFiles, connect, disconnect }
}
