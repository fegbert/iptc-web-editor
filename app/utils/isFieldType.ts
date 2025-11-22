import type { IPTCFieldWithValue } from './iptc-iim/types'

export default function isFieldType<T extends IPTCFieldWithValue['type']>(type: T, field: IPTCFieldWithValue): field is IPTCFieldWithValue & { type: T } {
  return field.type === type
}
