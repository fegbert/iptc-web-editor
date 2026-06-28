import { clerkClient } from '@clerk/nuxt/server'

declare module 'h3' {
  interface H3EventContext {
    clerk: ReturnType<typeof clerkClient>
  }
}

export default eventHandler((event) => {
  event.context.clerk = clerkClient(event)
})
