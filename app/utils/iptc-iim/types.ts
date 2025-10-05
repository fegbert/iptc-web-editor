type IPTCFieldKey = `${number}:${number}`
type IPTCFieldType = 'text' | 'number' | 'datetime' | 'date' | 'time'

export interface IPTCField {
  title: string
  description: string
  type: IPTCFieldType
  mandatory: boolean
  repeatable: boolean
}

export type IPTCFields = Record<IPTCFieldKey, IPTCField>
