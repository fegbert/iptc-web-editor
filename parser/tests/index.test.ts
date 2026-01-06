import fs from 'node:fs'
import { afterEach, describe, expect, it } from 'vitest'
import { parseMetadata, writeMetadata } from '../src/index'
import { APP13_SEGMENT, IPTC_RESOURCE_ID, IRB_SIGNATURE, JPEG_SOI_MARKER, PHOTOSHOP_HEADER } from '../src/jpeg-iim/constants'

describe('jPEG IIM Reader', () => {
  it('should extract IPTC-IIM block from JPEG buffer', () => {
    const jpeg = fs.readFileSync('./tests/assets/test01.jpg')
    const metaData = parseMetadata(jpeg)

    expect(metaData).toMatchObject({
      '1:90': '\x1B%G',
      '2:00': '\x00\x04',
      '2:55': '20110403',
      '2:62': '20110403',
      '2:63': '131634+0200',
      '2:80': 'Frank Fotofan',
      '2:90': 'Wien',
      '2:92': 'Rathausplatz',
      '2:100': 'AT',
      '2:101': 'Österreich / Austria',
      '2:105': 'Bikefestival',
      '2:110': 'Frank Fotofan',
      '2:116': 'Copyright 2012 Frank Fotofan - www.ffotofan.info - Rechte vorbehalten/Rights reserved',
      '2:120': 'Bikefestival inWien, Rathausplatz',
    })
  })
})

describe('parsing of JPEG IPTC-IIM-Metadata', () => {
  const testFilePath = './tests/assets/test01.jpg'
  const updatedTestFilePath = './tests/assets/test01-updated.jpg'

  afterEach(() => {
    if (fs.existsSync(updatedTestFilePath)) {
      fs.unlinkSync(updatedTestFilePath)
    }
  })

  it('should extract metadata block from JPEG buffer', () => {
    const jpeg = fs.readFileSync(testFilePath)
    const metaData = parseMetadata(jpeg)

    expect(metaData).toMatchObject({
      '1:90': '\x1B%G',
      '2:00': '\x00\x04',
      '2:55': '20110403',
      '2:62': '20110403',
      '2:63': '131634+0200',
      '2:80': 'Frank Fotofan',
      '2:90': 'Wien',
      '2:92': 'Rathausplatz',
      '2:100': 'AT',
      '2:101': 'Österreich / Austria',
      '2:105': 'Bikefestival',
      '2:110': 'Frank Fotofan',
      '2:116': 'Copyright 2012 Frank Fotofan - www.ffotofan.info - Rechte vorbehalten/Rights reserved',
      '2:120': 'Bikefestival inWien, Rathausplatz',
    })
  })

  it('should extract metadata and write it back to a new file', () => {
    const jpeg = fs.readFileSync(testFilePath)
    const metaData = parseMetadata(jpeg)

    expect(metaData).toBeDefined()

    const metaDataWithUpdatedLocation = {
      ...metaData,
      '2:90': 'Cologne',
    }

    writeMetadata(jpeg, metaDataWithUpdatedLocation, updatedTestFilePath)
    expect(fs.existsSync(updatedTestFilePath)).toBe(true)

    const updatedJpeg = fs.readFileSync(updatedTestFilePath)
    const updatedMetaData = parseMetadata(updatedJpeg)

    expect(updatedMetaData).toMatchObject(metaDataWithUpdatedLocation)
  })
})

describe('extended-length IPTC-IIM dataset parsing', () => {
  it('should parse datasets using extended length descriptor', () => {
    // Build a minimal JPEG buffer with an APP13 segment containing an IPTC-IIM block

    // Empty name with padding to even
    const NAME = new Uint8Array([0x00, 0x00])

    const RESOURCE_ID = new Uint8Array([
      (IPTC_RESOURCE_ID >> 8) & 0xFF,
      IPTC_RESOURCE_ID & 0xFF,
    ])

    const SOI = new Uint8Array(JPEG_SOI_MARKER)

    // Construct an IPTC dataset: Record 2, Dataset 120 (Caption), extended length
    const marker = 0x1C
    const record = 0x02
    const dataset = 0x78 // 120

    // Actual data length: 40,000 bytes; descriptor length: 4 bytes
    const actualLength = 40000
    const descriptorLength = 4
    const octet4 = 0x80 | ((descriptorLength >> 8) & 0x7F)
    const octet5 = descriptorLength & 0xFF

    const descriptor = new Uint8Array([
      (actualLength >> 24) & 0xFF,
      (actualLength >> 16) & 0xFF,
      (actualLength >> 8) & 0xFF,
      actualLength & 0xFF,
    ])

    const data = new Uint8Array(actualLength)
    data.fill(0x41) // 'A'

    const iimBlock = new Uint8Array(1 + 1 + 1 + 2 + descriptor.length + data.length)
    iimBlock[0] = marker
    iimBlock[1] = record
    iimBlock[2] = dataset
    iimBlock[3] = octet4
    iimBlock[4] = octet5
    iimBlock.set(descriptor, 5)
    iimBlock.set(data, descriptor.length + 5)

    // IRB data size (4 bytes big-endian)
    const dataSize = iimBlock.length
    const DATA_SIZE = new Uint8Array([
      (dataSize >> 24) & 0xFF,
      (dataSize >> 16) & 0xFF,
      (dataSize >> 8) & 0xFF,
      dataSize & 0xFF,
    ])

    // Assemble segment payload
    const segmentDataParts = [PHOTOSHOP_HEADER, IRB_SIGNATURE, RESOURCE_ID, NAME, DATA_SIZE, iimBlock]
    const segmentDataLength = segmentDataParts.reduce((sum, arr) => sum + arr.length, 0)
    const segmentData = new Uint8Array(segmentDataLength)

    segmentDataParts.reduce<number>((sum, part) => {
      segmentData.set(part, sum)
      sum += part.length
      return sum
    }, 0)

    // APP13 marker + length (length equals segment data length per implementation)
    const APP13 = new Uint8Array(APP13_SEGMENT)
    const L = segmentData.length
    const LEN = new Uint8Array([(L >> 8) & 0xFF, L & 0xFF])

    const jpeg = new Uint8Array(SOI.length + APP13.length + LEN.length + segmentData.length)
    let offset = 0
    jpeg.set(SOI, offset)
    offset += SOI.length
    jpeg.set(APP13, offset)
    offset += APP13.length
    jpeg.set(LEN, offset)
    offset += LEN.length
    jpeg.set(segmentData, offset)

    const meta = parseMetadata(jpeg)
    const expectedValue = 'A'.repeat(actualLength)
    expect(meta['2:120']).toBe(expectedValue)
  })
})

describe('extended-length IPTC-IIM dataset writing', () => {
  it('should write and round-trip extended-length datasets', async () => {
    const jpeg = fs.readFileSync('./tests/assets/test01.jpg')

    // Create a large payload (40,000 bytes) to trigger extended-length encoding
    const largeValue = 'X'.repeat(40000)
    const metadataWithLarge = {
      '2:120': largeValue,
    }

    // Write the extended-length metadata to a temp file
    const tempPath = './tests/assets/test-extended.jpg'
    await writeMetadata(jpeg, metadataWithLarge, tempPath)

    // Read it back and verify the large value is preserved
    const updatedJpeg = fs.readFileSync(tempPath)
    const parsedMeta = parseMetadata(updatedJpeg)

    expect(parsedMeta['2:120']).toBe(largeValue)
    expect(parsedMeta['2:120']?.length).toBe(40000)

    // Clean up
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }
  })
})
