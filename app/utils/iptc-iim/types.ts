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

interface IPTCFieldSlider extends IPTCFieldBase {
  type: 'slider'
  minValue: number
  maxValue: number
  minLabel: string
  maxLabel: string
  step?: number
}

interface IPTCFieldSelect extends IPTCFieldBase {
  type: 'select'
  options: { value: string, label: string }[]
}

interface IPTCFieldLocation extends IPTCFieldBase {
  type: 'location-code' | 'location-name'
  identifier: string
}

interface IPTCFieldReference extends IPTCFieldBase {
  type: 'reference-service' | 'reference-date' | 'reference-number'
  identifier: string
}

interface IPTCFieldOtherTypes extends IPTCFieldBase {
  type: 'date' | 'time' | 'object-type' | 'object-attribute' | 'subject-reference' | 'language'
}

export type IPTCField = IPTCFieldText | IPTCFieldNumber | IPTCFieldSelect | IPTCFieldSlider | IPTCFieldLocation | IPTCFieldReference | IPTCFieldOtherTypes

export type IPTCFieldWithValue = IPTCField & { value: string, original: string }
