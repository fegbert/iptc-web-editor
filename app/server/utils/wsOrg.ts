import type { WorkspaceServerEvent } from '../../shared/wsTypes'

interface SendablePeer {
  send: (data: unknown) => void
}

const peers = new Map<string, Set<SendablePeer>>()

export function registerPeer(orgId: string, peer: SendablePeer): () => void {
  if (!peers.has(orgId)) {
    peers.set(orgId, new Set())
  }

  peers.get(orgId)!.add(peer)
  return () => peers.get(orgId)?.delete(peer)
}

export function broadcastToOrg(orgId: string, message: WorkspaceServerEvent) {
  peers.get(orgId)?.forEach(peer => peer.send(JSON.stringify(message)))
}
