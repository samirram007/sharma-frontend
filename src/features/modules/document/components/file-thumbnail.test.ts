import { describe, expect, it } from 'vitest'
import { isImageMime } from './file-thumbnail'

describe('isImageMime', () => {
  it('recognizes all renderable image MIME types', () => {
    for (const mime of [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
    ]) {
      expect(isImageMime(mime), mime).toBe(true)
    }
  })

  it('rejects non-image and unknown MIME types', () => {
    expect(isImageMime('application/pdf')).toBe(false)
    expect(isImageMime('text/plain')).toBe(false)
    expect(isImageMime('image/heic')).toBe(false)
  })

  it('rejects null/undefined/empty MIME types', () => {
    expect(isImageMime(null)).toBe(false)
    expect(isImageMime(undefined)).toBe(false)
    expect(isImageMime('')).toBe(false)
  })
})
