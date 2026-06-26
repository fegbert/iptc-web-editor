import { iptcIimFields } from './iptc-iim/mapping'

export default function getFieldTitle(fieldId: string) {
  return iptcIimFields.find(field => field.key === fieldId)?.title || fieldId
}
