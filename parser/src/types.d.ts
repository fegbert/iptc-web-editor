export interface IptcPmdTechReference {
  documentation_available_at: string
  release_comment: string
  release_timestamp: string
  ipmd_top: Record<string, IpmdProperty>
  ipmd_struct: Record<string, Record<string, IpmdStructProperty>>
  et_topwithprefix: Record<string, EtMapping>
  et_topnoprefix: Record<string, EtMapping>
  et_instructure: Record<string, EtMapping>
}

export interface IpmdProperty {
  name: string
  label: string
  helptext: string
  usernotes: string
  ipmdschema: 'IptcCore' | 'IptcExt' | 'PLUS'
  sortorder: string
  ugtopic: string
  specidx: string
  datatype: 'string' | 'struct' | 'number' | 'any'
  dataformat?: string
  propoccurrence: 'single' | 'multi'
  isrequired: '0' | '1'
  IIMid?: string
  IIMname?: string
  IIMmaxbytes?: number
  XMPid?: string
  EXIFid?: string
  SCHEMAid?: string
  etXMP?: string
  etIIM?: string
  etEXIF?: string
  etTag?: string
}

export interface IpmdStructProperty {
  name: string
  label: string
  helptext: string
  usernotes: string
  ipmdschema: 'IptcCore' | 'IptcExt' | 'PLUS'
  sortorder: string
  specidx: string
  datatype: 'string' | 'struct' | 'number' | 'any'
  dataformat?: string
  propoccurrence: 'single' | 'multi'
  isrequired: '0' | '1'
  XMPid?: string
  EXIFid?: string
  SCHEMAid?: string
  etTag?: string
  etEXIF?: string
  // Special properties for AltLang structure
  Note?: string
  BCP47langid_1?: string
  BCP47langid_toMany?: string
}

export interface EtMapping {
  ipmdid: string
  label?: string
  sortorder?: string
  output?: 'any' | 'none'
}

export type Standard = 'IPTC-IIM'
