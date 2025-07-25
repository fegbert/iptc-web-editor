import fs from 'node:fs'
import { afterEach, describe, expect, it } from 'vitest'
import { helloWorld } from '../src/index'
import { extractIIMBlockFromJPEG, parseIIM } from '../src/jpeg-iim/reader'
import { writeToJPEG } from '../src/jpeg-iim/writer'

describe('helloWorld function', () => {
  it('should return true', () => {
    expect(helloWorld()).toBe(true)
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
    const block = extractIIMBlockFromJPEG(jpeg)
    const metaData = parseIIM(block)

    expect(metaData).toMatchObject({
      '1:90': '\x1B%G',
      '2:0': '\x00\x04',
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
    const block = extractIIMBlockFromJPEG(jpeg)
    const metaData = parseIIM(block)

    expect(metaData).toBeDefined()

    const metaDataWithUpdatedLocation = {
      ...metaData,
      '2:90': 'Cologne',
    }

    writeToJPEG(jpeg, metaDataWithUpdatedLocation, updatedTestFilePath)
    expect(fs.existsSync(updatedTestFilePath)).toBe(true)

    const updatedJpeg = fs.readFileSync(updatedTestFilePath)
    const updatedBlock = extractIIMBlockFromJPEG(updatedJpeg)
    const updatedMetaData = parseIIM(updatedBlock)

    expect(updatedMetaData).toMatchObject(metaDataWithUpdatedLocation)
  })
})
