import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseMetadata } from '../src/index'

describe('jPEG IIM Reader', () => {
  it('should extract IPTC-IIM block from JPEG buffer', () => {
    const jpeg = fs.readFileSync('./tests/assets/test01.jpg')
    const metaData = parseMetadata(jpeg)

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
})
