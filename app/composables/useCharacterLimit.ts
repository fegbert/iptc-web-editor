import type { IPTCField } from '~/utils/iptc-iim/types'

export default function useCharacterLimit(value: Ref<string | undefined>, octets?: IPTCField['octets']) {
  const limits = computed(() => {
    if (typeof octets === 'number') {
      return { max: octets }
    }

    return octets
  })

  function digits(n?: number) {
    return (n ?? 0).toString().length
  }

  const characterCountText = computed(() => {
    if (!limits.value) {
      return undefined
    }

    return `${value.value?.length ?? 0}/${limits.value.max}`
  })

  const characterCountWidth = computed(() => {
    if (!limits.value) {
      return undefined
    }

    const ch = digits(value.value?.length) + 1 + digits(limits.value.max)
    return `${ch}ch`
  })

  return { limits, characterCountWidth, characterCountText }
}
