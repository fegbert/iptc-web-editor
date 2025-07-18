import { IPTC_RESOURCE_ID, IRB_SIGNATURE, PHOTOSHOP_HEADER } from './constants'

/**
 * Converts the length of a JPEG segment from its byte representation to a number.
 * @param buffer The JPEG file buffer
 * @param offset The current offset in the buffer
 * @returns A number representing the length of the segment
 */
export function calculateSegmentLength(buffer: Uint8Array, offset: number): number {
  if (offset + 3 >= buffer.length) {
    throw new Error('Buffer too short to read segment length')
  }

  const lengthStart = offset + 2

  // The length of the data is stored in the two bytes after the marker
  // We are shifting the first byte left by 8 bits (1 byte) to make space for the second byte behind it, then add them together
  return (buffer[lengthStart] << 8 | buffer[lengthStart + 1])
}

/**
 * Checks if a segment is matching the Photoshop header.
 * @param segment The segment to check
 * @returns True if the segment matches the Photoshop header, false otherwise
 */
export function isSegmentMatchingPhotoshopHeader(segment: Uint8Array) {
  // Check that segment matches the Photoshop header by comparing each byte
  return PHOTOSHOP_HEADER.filter((byte, index) => byte !== segment[index]).length === 0
}

/**
 * Checks if a segment matches the Adobe Image Resource Block (IRB) signature at a given position.
 * @param segment The segment to check
 * @param position The position in the segment to check for the IRB signature
 * @returns True if the segment matches the IRB signature at the given position, false otherwise
 */
function isSegmentMatchingSignature(segment: Uint8Array, position: number): boolean {
  // Check if the segment matches the IRB signature at the given position
  for (let i = 0; i < IRB_SIGNATURE.length; i++) {
    if (segment[position + i] !== IRB_SIGNATURE[i]) {
      return false
    }
  }
  return true
}

/**
 * Searches a segment for Image Resource Blocks (IRBs) and returns the IPTC-IIM block if found.
 * @param segment The segment to search for Image Resource Blocks (IRBs)
 * @param offset The offset in the segment to start searching from
 * @returns The IPTC-IIM block if found, or throws an error if nothing is found.
 */
export function searchSegmentForImageResourceBlocks(segment: Uint8Array, offset: number): Uint8Array {
  let position = offset
  // Check if the segment is long enough to contain an IRB
  while (position + 10 < segment.length) {
    if (isSegmentMatchingSignature(segment, position)) {
      // Extract the resource ID, name length and data size

      // Combining bytes to form the resource ID
      const resourceId = (segment[position + 4] << 8) | segment[position + 5]

      // The name length is stored in the 6th byte after the signature
      const nameLength = segment[position + 6]

      // If the name length is odd, we need to add a padding to make it even
      const nameEnd = position + 7 + nameLength + (nameLength % 2 === 0 ? 1 : 0)

      // Add the next 4 bytes together to get the data size
      const dataSize = (segment[nameEnd] << 24) | (segment[nameEnd + 1] << 16) | (segment[nameEnd + 2] << 8) | segment[nameEnd + 3]

      const dataStart = nameEnd + 4
      const dataEnd = dataStart + dataSize

      if (resourceId === IPTC_RESOURCE_ID) {
        // Found the IPTC-IIM block, return it
        return segment.subarray(dataStart, dataEnd)
      }

      // If dataEnd is odd, we need to add padding to make it even
      position = dataEnd + (dataEnd % 2)
    }
  }
  throw new Error('No IPTC-IIM block was found in the segment')
}
