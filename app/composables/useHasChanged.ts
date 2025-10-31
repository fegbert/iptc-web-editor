export default function useHasChanged(original: Ref<string | undefined>, current: Ref<string | undefined>) {
  return computed(() => {
    if (!original.value && !current.value) {
      return false
    }

    return original.value !== current.value
  })
}
