import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

export default function useHasChanged(field: Ref<IPTCFieldWithValue>) {
  const originalValue = computed(() => field.value.original)
  const currentValue = computed(() => field.value.value)

  return computed(() => {
    if (!originalValue.value && !currentValue.value) {
      return false
    }

    return originalValue.value !== currentValue.value
  })
}
