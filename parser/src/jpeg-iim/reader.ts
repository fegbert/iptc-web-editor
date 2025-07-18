import { APP13_SEGMENT, IPTC_TAG_MARKER, PHOTOSHOP_HEADER } from './constants'
import { calculateSegmentLength, isSegmentMatchingPhotoshopHeader, searchSegmentForImageResourceBlocks } from './helpers'

/**
 * Extracts the IPTC-IIM block from a JPEG file buffer.
 * @param buffer The JPEG file buffer to extract the IPTC-IIM block from
 * @returns The extracted IPTC-IIM block as a Uint8Array
 */
export function extractIIMBlockFromJPEG(buffer: Uint8Array): Uint8Array {
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

export function parseIIM(buffer: Uint8Array): Record<string, any> {
  const result: Record<string, string | string[]> = {}
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)

  let offset = 0

  while (offset < buffer.length) {
    if (buffer[offset] !== IPTC_TAG_MARKER) {
      offset++
      continue
    }

    if (offset + 5 > buffer.length) {
      break
    }

    const record = buffer[offset + 1]
    const dataset = buffer[offset + 2]
    const length = view.getUint16(offset + 3)

    const tag = `${record}:${dataset}`

    const start = offset + 5
    const end = start + length
    if (end > buffer.length) {
      break
    }

    const value = new TextDecoder().decode(buffer.subarray(start, end))

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
