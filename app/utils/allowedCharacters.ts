import { CharacterTypes } from './iptc-iim/types'

const characterGroups: Record<CharacterTypes, RegExp> = {
  [CharacterTypes.alphabetic]: /[a-z]+$/gi,
  [CharacterTypes.numeric]: /\d+$/g,
  [CharacterTypes.graphic]: /^[^\p{C}\p{Z}]+$/u,
  [CharacterTypes.space]: /\s+$/g,
  [CharacterTypes.linefeed]: /\n+$/g,
  [CharacterTypes.return]: /\r+$/g,
}

export function isValid(value: string, allowedTypes: CharacterTypes[]): boolean {
  if (allowedTypes.length === 0) {
    return true
  }

  const chars = value.split('')

  return chars.every((char) => {
    const validPerType = allowedTypes.map((type) => {
      const regex = characterGroups[type]
      const matchedChar = char.match(regex)
      return matchedChar
    })

    return validPerType.some(v => v)
  })
}
