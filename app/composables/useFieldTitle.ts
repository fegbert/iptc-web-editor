export default function useFieldTitle(title: string) {
  return computed(() => {
    return title.charAt(0).toUpperCase() + title.slice(1)
  })
}
