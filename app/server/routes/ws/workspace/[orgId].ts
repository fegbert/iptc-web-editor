import z from 'zod'
import { registerPeer } from '~/server/utils/wsOrg'

const orgIdSchema = z.object({ orgId: z.string() })
const cleanupSchema = z.object({ cleanup: z.function() })

export default defineWebSocketHandler({
  upgrade(request) {
    const url = new URL(request.url)
    const orgId = url.pathname.split('/').at(-1)

    if (!orgId) {
      throw new Response('Bad Request', { status: 400 })
    }

    // TODO: verify clerk sesion here
    request.context.orgId = orgId
  },

  open(peer) {
    const { orgId } = orgIdSchema.safeParse(peer.context).data ?? {}

    if (!orgId) {
      peer.close(400, 'Bad Request')
      return
    }

    const cleanup = registerPeer(orgId, peer)
    peer.context.cleanup = cleanup
  },

  close(peer) {
    const cleanup = cleanupSchema.safeParse(peer.context).data?.cleanup
    cleanup?.()
  },
})
