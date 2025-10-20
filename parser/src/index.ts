import type { FileWithHandle } from 'browser-fs-access'
import type { Standard } from './types'
import { parseIIM } from './jpeg-iim/reader'
import { writeToJPEG } from './jpeg-iim/writer'

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

/**
 * Writes metadata to the specified image file and saves it at the specified path.
 * @param image The image buffer to write metadata to.
 * @param metadata The metadata to write to the image.
 * @param path [Optional] The file path to save the updated image.
 * @param fileHandle [Optional] A FileSystemFileHandle to write the updated image directly.
 * @param standard [Optional] The metadata standard to use. Currently only 'IPTC-IIM' is supported.
 * @param fileType [Optional] The type of the image file. Currently only 'JPEG' is supported.
 */
async function writeMetadata(image: FileWithHandle | Uint8Array, metadata: Record<string, string>, path?: string, fileHandle?: FileSystemFileHandle, standard: Standard = 'IPTC-IIM', fileType: 'JPEG' = 'JPEG') {
  switch (standard) {
    case 'IPTC-IIM':
      if (fileType !== 'JPEG') {
        throw new Error('IPTC-IIM metadata can only be written to JPEG files.')
      }
      return writeToJPEG(image, metadata, path, fileHandle)
    default:
      throw new Error(`Unsupported metadata standard: ${standard}`)
  }
}

export { parseMetadata, writeMetadata }
