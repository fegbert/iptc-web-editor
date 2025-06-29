import { describe, expect, it } from 'vitest'
import { helloWorld } from '../src/index'

describe('helloWorld function', () => {
  it('should return true', () => {
    expect(helloWorld()).toBe(true)
  })
})
