type IPTCFieldKey = `${number}:${number}`

export enum CharacterTypes {
  graphic = 'Graphic Characters',
  space = 'Space',
  alphabetic = 'Alphabetic Characters (A-Z, a-z)',
  numeric = 'Numeric Characters (0-9)',
  return = 'Carriage Return',
  linefeed = 'Line Feed',
}

interface IPTCFieldBase {
  key: IPTCFieldKey
  title: string
  description: string
  octets?: number | { min?: number, max?: number }
  mandatory: boolean
  repeatable: boolean
  parent?: IPTCFieldKey
  deprecated?: boolean
}

interface IPTCFieldText extends IPTCFieldBase {
  type: 'text' | 'textarea'
  allowedCharacterTypes?: CharacterTypes[]
}

interface IPTCFieldNumber extends IPTCFieldBase {
  type: 'number'
  minValue?: number
  maxValue?: number
}

interface IPTCFieldSelect extends IPTCFieldBase {
  type: 'select'
  options: { value: string, label: string }[]
}

interface IPTCFieldOtherTypes extends IPTCFieldBase {
  type: 'date' | 'time' | 'object-type' | 'object-attribute' | 'subject-reference'
}

export type IPTCField = IPTCFieldText | IPTCFieldNumber | IPTCFieldSelect | IPTCFieldOtherTypes

export type IPTCFieldWithValue = IPTCField & { value: string, original: string }
