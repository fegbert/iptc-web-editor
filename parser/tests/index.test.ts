import { describe, expect, it } from 'vitest'
import { helloWorld } from '../src/index'
import { extractIIMBlockFromJPEG, parseIIM } from '../src/reader/jpeg-iim/jpeg-reader'
import fs from 'fs'

describe('helloWorld function', () => {
  it('should return true', () => {
    expect(helloWorld()).toBe(true)
  })
})

describe('JPEG IIM Reader', () => {
  it('should extract IPTC-IIM block from JPEG buffer', () => {
    const jpeg = fs.readFileSync('./tests/assets/test01.jpg')
    const block = extractIIMBlockFromJPEG(jpeg)
    const metaData = parseIIM(block)

    console.log('test', metaData)
    expect(metaData).toBeDefined()
  })
})
