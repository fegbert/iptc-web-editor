import { IptcPmdTechReference } from '../types'
import * as iptc2024 from './iptc-pmd-techreference_2024.1.json'

type REFERENCE_VERSIONS = '2024.1'

const REFERENCE_MAPPING: Record<REFERENCE_VERSIONS, IptcPmdTechReference> = {
  '2024.1': iptc2024 as unknown as IptcPmdTechReference,
}

export function getIIMNameByTag(tag: string, version: REFERENCE_VERSIONS = '2024.1'): string {
  const fields = REFERENCE_MAPPING[version]['ipmd_top']
  const fieldWithTag = Object.values(fields).find(field => field.IIMid === tag)
  return fieldWithTag?.IIMname ?? tag
}

export function getIIMTagByName(name: string, version: REFERENCE_VERSIONS = '2024.1'): string {
  const fields = REFERENCE_MAPPING[version]['ipmd_top']
  const fieldWithName = Object.values(fields).find(field => field.IIMname === name)
  return fieldWithName?.IIMid ?? name
}
