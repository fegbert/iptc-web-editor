import type { IPTCFieldWithValue } from '~/utils/iptc-iim/types'

export default function useHasChanged(fileId: Ref<string>, field: Ref<IPTCFieldWithValue>) {
  const currentValue = computed(() => field.value.value)
  const { getOriginal } = useFiles()
  const originalValue = computed(() => getOriginal(fileId.value, field.value.key))

  const proposalCtx = inject<{ isPendingField: (key: string) => boolean } | null>('editorProposal', null)

  return computed(() => {
    if (!fileId.value) {
      return false
    }
    if (proposalCtx?.isPendingField(field.value.key)) {
      return false
    }
    if (!originalValue.value && !currentValue.value) {
      return false
    }

    return originalValue.value !== currentValue.value
  })
}
