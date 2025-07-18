/* ----- Constants ----- */

// 0xFFED - APP13 Segment
export const APP13_SEGMENT = [0xFF, 0xED]

// Photoshop Header, marking the start of the IIM data
export const PHOTOSHOP_HEADER = new TextEncoder().encode('Photoshop 3.0\0')

// Adobe Image Resource Block (IRB) signature
export const IRB_SIGNATURE = new TextEncoder().encode('8BIM')

// IPTC IIM Image Resource ID
export const IPTC_RESOURCE_ID = 0x0404

// IPTC Tag Marker
export const IPTC_TAG_MARKER = 0x1C

// JPEG Start of Image (SOI) marker
export const JPEG_SOI_MARKER = [0xFF, 0xD8]
