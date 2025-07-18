import { APP13_SEGMENT, IPTC_RESOURCE_ID, IPTC_TAG_MARKER, JPEG_SOI_MARKER, PHOTOSHOP_HEADER } from './constants'
import { concatUint8Arrays } from './helpers'
import fs from 'node:fs'

function encodeData(fields: Record<string, string>) {
  const encodedFields = Object.entries(fields).map(([key, value]) => {
    const encodedData = new TextEncoder().encode(value)
    const length = encodedData.length

    const [prefix, id] = key.split(':')

    const field = new Uint8Array(5 + length)

    field[0] = IPTC_TAG_MARKER
    field[1] = Number(prefix)
    field[2] = Number(id)
    field[3] = (length >> 8) & 0xFF
    field[4] = length & 0xFF

    field.set(encodedData, 5)

    return field
  })

  return concatUint8Arrays(encodedFields)
}

function wrapDataInIRB(data: Uint8Array) {
  const dataSize = new Uint8Array([
    data.length >> 24 & 0xFF,
    data.length >> 16 & 0xFF,
    data.length >> 8 & 0xFF,
    data.length & 0xFF,
  ])

  const paddedData = data.length % 2 === 0 ? data : Uint8Array.from([...data, 0])

  const resourceId = new Uint8Array([
    (IPTC_RESOURCE_ID >> 8) & 0xFF,
    IPTC_RESOURCE_ID & 0xFF,
  ])

  return concatUint8Arrays([
    PHOTOSHOP_HEADER,
    resourceId,
    new Uint8Array([0, 0]), // "name" field - empty for IPTC-IIM
    dataSize,
    paddedData,
  ])
}

function wrapDataInAPP13(data: Uint8Array) {
  const payload = concatUint8Arrays([PHOTOSHOP_HEADER, data])

  // +2 to account for the length bytes as well
  const lengthBytes = new Uint8Array([
    (payload.length + 2) >> 8 & 0xFF,
    (payload.length + 2) & 0xFF,
  ])

  return concatUint8Arrays([
    new Uint8Array(APP13_SEGMENT),
    lengthBytes,
    payload,
  ])
}

export function writeToJPEG(jpegBuffer: Uint8Array, data: Record<string, string>, path: string) {
  if (jpegBuffer[0] !== JPEG_SOI_MARKER[0] || jpegBuffer[1] !== JPEG_SOI_MARKER[1]) {
    throw new Error('Invalid JPEG file: does not start with SOI marker')
  }

  let offset = 2

  while (
    offset < jpegBuffer.length &&
    jpegBuffer[offset] === APP13_SEGMENT[0] &&
    jpegBuffer[offset + 1] !== APP13_SEGMENT[1]
  ) {
    const segmentLength = (jpegBuffer[offset + 2] << 8) | jpegBuffer[offset + 3]
    offset += segmentLength + 2
  }

  if (offset + 5 >= jpegBuffer.length) {
    throw new Error('Invalid JPEG file: APP13 segment not found or too short')
  }

  const before = jpegBuffer.subarray(0, offset)
  const after = jpegBuffer.subarray(offset)

  const encodedData = encodeData(data)
  const irbData = wrapDataInIRB(encodedData)
  const app13Data = wrapDataInAPP13(irbData)

  const output = new Uint8Array(before.length + app13Data.length + after.length)
  output.set(before, 0)
  output.set(app13Data, before.length)
  output.set(after, before.length + app13Data.length)

  fs.writeFileSync(path, output)
}
