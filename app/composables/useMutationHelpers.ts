import type { MutationOptions, UseMutationOptions } from '@tanstack/vue-query'
import type { z } from 'zod'
import { useMutation as tanstackUseMutation, useQueryClient } from '@tanstack/vue-query'

// The typing between trpc and tanstack query is a bit awkward, so we create a helper that allows us to use trpc mutations with the same options as tanstack query,
// but also allows us to pass a trpc mutation function directly. This way we can avoid having to wrap every trpc mutation in a separate function that
// calls the trpc mutation and then passes the result to the tanstack mutation function.
type TrpcCompatibleMutationOptions<TData, TError, TVariables, TContext>
  = Omit<MutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> & {
    mutationFn?: (variables: TVariables) => Promise<TData>
  }

function useMutation<TData, TError = Error, TVariables = void, TContext = unknown>(
  options: TrpcCompatibleMutationOptions<TData, TError, TVariables, TContext>,
) {
  return tanstackUseMutation(options as UseMutationOptions<TData, TError, TVariables, TContext>)
}

function formatTrpcErrorErrorMessage(error: Error | null): string {
  if (!error || !error.message) {
    return 'Unknown error'
  }

  try {
    // Note: trpc returns zod errors as stringified json
    const zodErrors = JSON.parse(error.message)
    if (Array.isArray(zodErrors)) {
      return zodErrors.map((zodError: z.core.$ZodIssue) => {
        return `${zodError.message} '/${zodError.path.join('/')}'`
      }).join(', ')
    }
    return error.message
  }
  catch {
    return error.message
  }
}

function makeTrpcErrorToast(notification: ReturnType<typeof useToast>, options: Parameters<ReturnType<typeof useToast>['add']>[0]) {
  return (error: Error | null) => {
    const description = options.description ?? 'The data could not be updated.'

    notification.add({
      title: options.title ?? 'Operation Failed',
      description: `${description} ${error ? `(Error: ${formatTrpcErrorErrorMessage(error)})` : ''}`,
      color: 'error',
      duration: options.duration ?? 5000,
    })
  }
}

export default () => {
  const { $trpc } = useNuxtApp()
  const queryClient = useQueryClient()

  return {
    $trpc,
    queryClient,
    useMutation,
    makeTrpcErrorToast,
  }
}
