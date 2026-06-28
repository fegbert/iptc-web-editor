import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query'
import { dehydrate, hydrate, QueryCache, QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  const errorNotification = (error: unknown, errorKey: string) => {
    if (import.meta.server) {
      // Skip showing errors on server obviously
      return
    }

    const notification = useToast()
    const title = 'Operation failed'
    const duration = 5 * 1000 // ms

    const { isSignedIn } = useAuth()

    if (!isSignedIn.value) {
      notification.add({
        color: 'error',
        title,
        duration,
        description: 'You must be logged in to use this functionality.',
      })
      return
    }

    notification.add({
      color: 'error',
      title,
      duration,
      description: `An error occurred while ${errorKey}. ${error ? ` (Error: ${String(error)}` : ''}`,
    })
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.skipError) {
          return
        }

        errorNotification(
          error,
          // `errorKey` either doesn't exist OR is a string, so we can safely cast it to string. If it doesn't exist, we fallback to 'Unknown data'
          query.meta?.errorKey ? (query.meta.errorKey as string) : 'Unknown data',
        )
      },
    }),
  })

  const options: VueQueryPluginOptions = { queryClient }

  nuxt.vueApp.use(VueQueryPlugin, options)

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    nuxt.hooks.hook('app:created', () => {
      hydrate(queryClient, vueQueryState.value)
    })
  }
})
