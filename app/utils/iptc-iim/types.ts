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
  type: 'date' | 'time' | 'datetime' | 'object-type' | 'object-attribute' | 'subject-reference' | 'image-type'
}

export type IPTCField = IPTCFieldText | IPTCFieldNumber | IPTCFieldSelect | IPTCFieldOtherTypes

/**
 * As per IPTC IIM Specification 4.2 - Appendix G
 * Source: https://www.iptc.org/std/IIM/4.2/specification/IIMV4.2.pdf
 */
export const objectTypes = [
  { number: '01', name: 'News' },
  { number: '02', name: 'Data' },
  { number: '03', name: 'Advisory' },
]

/**
 * As per IPTC IIM Specification 4.2 - Appendix G
 * Source: https://www.iptc.org/std/IIM/4.2/specification/IIMV4.2.pdf
 */
export const objectAttributes = [
  { number: '001', name: 'Current' },
  { number: '002', name: 'Analysis' },
  { number: '003', name: 'Archive material' },
  { number: '004', name: 'Background' },
  { number: '005', name: 'Feature' },
  { number: '006', name: 'Forecast' },
  { number: '007', name: 'History' },
  { number: '008', name: 'Obituary' },
  { number: '009', name: 'Opinion' },
  { number: '010', name: 'Polls & Surveys' },
  { number: '011', name: 'Profile' },
  { number: '012', name: 'Results Listings & Tables' },
  { number: '013', name: 'Side bar & Supporting information' },
  { number: '014', name: 'Summary' },
  { number: '015', name: 'Transcript & Verbatim' },
  { number: '016', name: 'Interview' },
  { number: '017', name: 'From the Scene' },
  { number: '018', name: 'Retrospective' },
  { number: '019', name: 'Statistics' },
  { number: '020', name: 'Update' },
  { number: '021', name: 'Wrap-up' },
  { number: '022', name: 'Press Release' },
]
