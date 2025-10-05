type IPTCFieldKey = `${number}:${number}`

export type FieldTypes = 'text' | 'number' | 'datetime' | 'date' | 'time' | 'select' | 'textarea' | 'subject-reference'

type CharacterTypes = 'graphic' | 'space' | 'alphabetic' | 'numeric' | 'return' | 'linefeed'

export interface IPTCFieldBase {
  key: IPTCFieldKey
  type: FieldTypes
  title: string
  description: string
  octets: { min?: number, max?: number }
  mandatory: boolean
  repeatable: boolean
  parent?: IPTCFieldKey
  deprecated?: boolean
}

export interface IPTCFieldText extends IPTCFieldBase {
  type: 'text' | 'textarea'
  allowedCharacterTypes: CharacterTypes
}

export interface IPTCFieldNumber extends IPTCFieldBase {
  type: 'number'
  minValue?: number
  maxValue?: number
}

export interface IPTCFieldSelect extends IPTCFieldBase {
  type: 'select'
  options: { value: string, label: string }[]
}
