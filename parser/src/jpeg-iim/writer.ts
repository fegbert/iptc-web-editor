import fs from 'node:fs'
import { fileSave } from 'browser-fs-access'
import { APP13_SEGMENT, IPTC_RESOURCE_ID, IPTC_TAG_MARKER, IRB_SIGNATURE, JPEG_SOI_MARKER, PHOTOSHOP_HEADER } from './constants'
import { calculateSegmentLength, concatUint8Arrays, isSegmentMatchingPhotoshopHeader } from './helpers'

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
  const paddedData = data.length % 2 === 0 ? data : Uint8Array.from([...data, 0])

  const dataSize = new Uint8Array([
    paddedData.length >> 24 & 0xFF,
    paddedData.length >> 16 & 0xFF,
    paddedData.length >> 8 & 0xFF,
    paddedData.length & 0xFF,
  ])

  const resourceId = new Uint8Array([
    (IPTC_RESOURCE_ID >> 8) & 0xFF,
    IPTC_RESOURCE_ID & 0xFF,
  ])

  return concatUint8Arrays([
    IRB_SIGNATURE,
    resourceId,
    new Uint8Array([0x00, 0x00]), // "name" field + padding - empty for IPTC-IIM
    dataSize,
    paddedData,
  ])
}

function wrapDataInAPP13(data: Uint8Array) {
  const payload = concatUint8Arrays([PHOTOSHOP_HEADER, data])
  const segmentLength = payload.length + 2 // +2 for the length bytes

  const lengthBytes = new Uint8Array([
    (segmentLength >> 8) & 0xFF,
    segmentLength & 0xFF,
  ])

  return concatUint8Arrays([
    new Uint8Array(APP13_SEGMENT),
    lengthBytes,
    payload,
  ])
}

export async function writeToJPEG(image: File | Uint8Array, data: Record<string, string>, path?: string, fileHandle?: FileSystemFileHandle) {
  const jpegBuffer = image instanceof File ? new Uint8Array(await image.arrayBuffer()) : image
  if (jpegBuffer[0] !== JPEG_SOI_MARKER[0] || jpegBuffer[1] !== JPEG_SOI_MARKER[1]) {
    throw new Error('Invalid JPEG file: does not start with SOI marker')
  }

  let offset = 2
  let insertBefore = 2
  let insertAfter: number | undefined

  while (
    offset + 4 < jpegBuffer.length
    && jpegBuffer[offset] === 0xFF
    && jpegBuffer[offset + 1] >= 0xE0
    && jpegBuffer[offset + 1] < 0xF0
  ) {
    const segmentType = jpegBuffer[offset + 1]
    const segmentLength = calculateSegmentLength(jpegBuffer, offset)

    const segmentStart = offset
    const segmentEnd = offset + segmentLength + 2

    if (segmentEnd > jpegBuffer.length) {
      throw new Error('Invalid JPEG file: segment length exceeds buffer size')
    }

    if (segmentType === APP13_SEGMENT[1]) {
      const payload = jpegBuffer.subarray(offset + 4, segmentEnd)

      if (isSegmentMatchingPhotoshopHeader(payload)) {
        insertBefore = segmentStart
        insertAfter = segmentEnd
        break
      }
    }

    insertBefore = segmentEnd
    offset = segmentEnd
  }

  const before = jpegBuffer.subarray(0, insertBefore)
  const after = insertAfter ? jpegBuffer.subarray(insertAfter) : jpegBuffer.subarray(insertBefore)

  const encodedData = encodeData(data)
  const irbData = wrapDataInIRB(encodedData)
  const app13Data = wrapDataInAPP13(irbData)

  const output = new Uint8Array(before.length + app13Data.length + after.length)
  output.set(before, 0)
  output.set(app13Data, before.length)
  output.set(after, before.length + app13Data.length)

  // 1. If path is provided, write the file at the specified path
  if (path) {
    try {
      fs.writeFileSync(path, output)
    }
    catch (error) {
      console.error('Error writing JPEG file:', error)
    }
  }

  // 2. If fileHandle is provided, use it to write the file
  else if (fileHandle) {
    try {
      const writeable = await fileHandle.createWritable()
      await writeable.write(output)
      await writeable.close()
    }
    catch (error) {
      console.error('Error writing JPEG file using file handle:', error)
    }
  }

  // 3. If neither is provided, download the file
  else {
    const blob = new Blob([output], { type: image instanceof File ? image.type : 'image/jpeg' })
    try {
      await fileSave(blob, {
        fileName: image instanceof File ? image.name : 'unnamed.jpg',
        extensions: ['.jpg', '.jpeg'],
      }, undefined)
    }
    catch (error) {
      console.warn('File save using browser-fs-access failed. Trying to download manually...')
      console.error('Error saving file:', error)
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const url = URL.createObjectURL(blob)
        const linkElement = document.createElement('a')
        linkElement.href = url
        linkElement.download = image instanceof File ? image.name : 'unnamed.jpg'
        document.body.appendChild(linkElement)
        linkElement.click()
        linkElement.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    }
  }
}
