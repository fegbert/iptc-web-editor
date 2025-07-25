import type { Standard } from './types'
import { parseIIM } from './jpeg-iim/reader'

/**
 * Parses the metadata from the given image buffer in the given standard.
 * @param data The image buffer containing the relevant metadata.
 * @param standard The metadata standard to parse. Currently only 'IPTC-IIM' is supported.
 * @returns The parsed metadata object.
 */
function parseMetadata(data: Uint8Array, standard: Standard = 'IPTC-IIM') {
  switch (standard) {
    case 'IPTC-IIM':
      return parseIIM(data)
    default:
      throw new Error(`Unsupported metadata standard: ${standard}`)
  }
}

export { parseMetadata }
