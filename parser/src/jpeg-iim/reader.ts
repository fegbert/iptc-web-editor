import { APP13_SEGMENT, IPTC_TAG_MARKER, PHOTOSHOP_HEADER } from './constants'
import { calculateSegmentLength, isSegmentMatchingPhotoshopHeader, searchSegmentForImageResourceBlocks } from './helpers'

/**
 * Extracts the IPTC-IIM block from a JPEG file buffer.
 * @param buffer The JPEG file buffer to extract the IPTC-IIM block from
 * @returns The extracted IPTC-IIM block as a Uint8Array
 */
function extractIIMBlockFromJPEG(buffer: Uint8Array): Uint8Array {
  let offset = 0

  while (offset < buffer.length - 1) {
    // Check if current bytes match the APP13 segment - It's two bytes long, so we check two bytes at a time
    if (buffer[offset] === APP13_SEGMENT[0] && buffer[offset + 1] === APP13_SEGMENT[1]) {
      const length = calculateSegmentLength(buffer, offset)
      const start = offset + 4 // Skipping the marker and length bytes
      const end = start + length

      const segment = buffer.subarray(start, end)

      if (!isSegmentMatchingPhotoshopHeader(segment)) {
        // If the segment does not match the Photoshop header, continue searching
        offset += length + 2 // Move past the current segment
        continue
      }

      return searchSegmentForImageResourceBlocks(segment, PHOTOSHOP_HEADER.length)
    }
    offset++
  }
  throw new Error('No IPTC-IIM block found in the JPEG file.')
}

/**
 * Parses the IPTC-IIM metadata from a JPEG file buffer into a readable JSON object.
 * @param buffer The JPEG file buffer.
 * @returns A JSON object containing the parsed IPTC-IIM metadata.
 */
export function parseIIM(buffer: Uint8Array): Record<string, any> {
  const iimBlock = extractIIMBlockFromJPEG(buffer)

  const result: Record<string, string | string[]> = {}
  const view = new DataView(iimBlock.buffer, iimBlock.byteOffset, iimBlock.byteLength)

  let offset = 0

  while (offset < iimBlock.length) {
    if (iimBlock[offset] !== IPTC_TAG_MARKER) {
      offset++
      continue
    }

    if (offset + 5 > iimBlock.length) {
      break
    }

    const record = iimBlock[offset + 1]
    const dataset = iimBlock[offset + 2]
    const tag = `${record}:${dataset.toString().padStart(2, '0')}`

    // Parse data length: support standard (2-byte) and extended-length descriptor
    const octet4 = iimBlock[offset + 3]
    const octet5 = iimBlock[offset + 4]

    let dataLength = 0
    let dataStart = 0

    // Extended-length flag is bit 7 of octet 4
    const isExtended = (octet4 & 0x80) !== 0
    if (isExtended) {
      // Length Descriptor length is the 15 LSB across octet4 (lower 7 bits) and octet5 taken together
      const descriptorLength = ((octet4 & 0x7F) << 8) | octet5
      dataStart = offset + 5 + descriptorLength

      const descriptorEnd = offset + 5 + descriptorLength
      if (descriptorEnd > iimBlock.length) {
        break
      }

      // Parse actual data length from descriptor bytes (big-endian integer)
      dataLength = 0
      for (let i = 0; i < descriptorLength; i++) {
        dataLength = (dataLength << 8) | iimBlock[offset + 5 + i]
      }
    }
    else {
      // Standard 2-byte big-endian length
      dataLength = view.getUint16(offset + 3)
      dataStart = offset + 5
    }

    const end = dataStart + dataLength
    if (end > iimBlock.length) {
      break
    }

    const value = new TextDecoder().decode(iimBlock.subarray(dataStart, end))

    if (tag in result) {
      const existing = result[tag]
      result[tag] = Array.isArray(existing)
        ? [...existing, value]
        : [existing as string, value]
    }
    else {
      result[tag] = value
    }

    offset = end
  }

  return result
}
