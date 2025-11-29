import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

export default function useHasChanged(fileId: string, field: Ref<IPTCFieldWithValue>) {
  const currentValue = computed(() => field.value.value)

  const { getOriginal } = useFiles()

  const originalValue = computed(() => getOriginal(fileId, field.value.key))

  return computed(() => {
    if (!originalValue.value && !currentValue.value) {
      return false
    }

    return originalValue.value !== currentValue.value
  })
}
