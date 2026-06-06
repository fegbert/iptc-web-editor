import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { H3Event } from 'h3'

export async function createTRPCContext(event: H3Event, _opts: FetchCreateContextFnOptions) {
  return {
    prisma: event.context.prisma,
    auth: event.context.auth(),
    event,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>
