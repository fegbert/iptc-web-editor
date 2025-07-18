import iptcTechReference from '../techReferences/iptc-pmd-techreference_2024.1.json'

type IpmdTopSchema = 'IptcCore' | 'IptcExt'
type IpmdStructSchema = 'IptcCore' | 'IptcExt' | 'PLUS'
type UgTopic = 'gimgcont' | 'location' | 'rights' | 'admin' | 'licensing' | 'person' | 'othings' | 'imgreg'
type DataType = 'struct' | 'string' | 'number'
type PropOccurrence = 'single' | 'multi'

type DataFormat = Exclude<keyof typeof iptcTechReference.ipmd_struct, 'AltLang'>
type IPTCField = keyof typeof iptcTechReference.ipmd_top

interface IPTCFieldData {
  name: string
  label: string
  helptext: string
  usernotes: string
  ipmdschema: IpmdTopSchema
  sortorder: string
  ugtopic: UgTopic
  specidx: string
  datatype: DataType
  dataformat?: DataFormat
  propoccurrence: PropOccurrence
  isrequired: '0' | '1'
  IIMid?: string
  IIMname?: string
  IIMmaxbytes?: number
  XMPid: string
  EXIFid?: string
  SCHEMAid?: string
  etXMP: string
  etIIM?: string
  etEXIF?: string
}

interface IPTCStructData {
  name: string
  label: string
  helptext: string
  usernotes: string
  ipmdschema: IpmdStructSchema
  sortorder: string
  specidx: string
  datatype: DataType | 'any'
  dataformat?: string
  propoccurrence: string
  isrequired: '0' | '1'
  XMPid: string
  etTag: string
}

function getIPTCFields(): Record<IPTCField, IPTCFieldData> {
  return iptcTechReference.ipmd_top as Record<IPTCField, IPTCFieldData>
}

export function getIIMFieldByTag(tag: string): IPTCFieldData | undefined {
  const iptcFields = getIPTCFields()
  return Object.values(iptcFields).find(field => field.IIMid === tag)
}
