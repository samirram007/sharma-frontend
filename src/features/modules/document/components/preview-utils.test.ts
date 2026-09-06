import { describe, expect, it } from 'vitest'
import type { DocumentNode } from '../data/schema'
import { describeNode, previewFamily, unsupportedHint } from './preview-utils'

function node(overrides: Partial<DocumentNode>): DocumentNode {
  return {
    id: 1,
    name: 'file',
    kind: 'file',
    visibility: 'private',
    parentId: null,
    ownerId: 1,
    sharedWith: [],
    ...overrides,
  } as DocumentNode
}

describe('previewFamily', () => {
  it('classifies renderable families', () => {
    expect(previewFamily(node({ mimeType: 'image/png' }))).toBe('image')
    expect(previewFamily(node({ mimeType: 'application/pdf' }))).toBe('pdf')
    expect(previewFamily(node({ mimeType: 'video/mp4' }))).toBe('video')
    expect(previewFamily(node({ mimeType: 'audio/mpeg' }))).toBe('audio')
    expect(previewFamily(node({ mimeType: 'text/plain' }))).toBe('text')
    expect(previewFamily(node({ extension: 'csv' }))).toBe('text')
  })

  it('falls back to text detection via extension when mime is octet-stream', () => {
    expect(
      previewFamily(
        node({ mimeType: 'application/octet-stream', extension: 'md' }),
      ),
    ).toBe('text')
  })

  it('marks office/unknown types unsupported', () => {
    expect(
      previewFamily(
        node({
          mimeType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      ),
    ).toBe('unsupported')
    expect(previewFamily(node({ mimeType: 'application/zip' }))).toBe(
      'unsupported',
    )
    expect(previewFamily(node({}))).toBe('unsupported')
  })
})

describe('describeNode', () => {
  it('produces friendly labels', () => {
    expect(
      describeNode(node({ mimeType: 'application/pdf', sizeBytes: 123 })),
    ).toBe('PDF document')
    expect(describeNode(node({ extension: 'docx' }))).toBe('DOCX file')
    expect(describeNode(node({ kind: 'folder' }))).toBe('Folder')
  })
})

describe('unsupportedHint', () => {
  it('explains Word files by extension and by mime', () => {
    const byExt = unsupportedHint(node({ extension: 'docx', name: 'a.docx' }))
    expect(byExt.title).toContain('Word')
    expect(byExt.hint).toContain('Download')

    const byMime = unsupportedHint(
      node({
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        name: 'b',
      }),
    )
    expect(byMime.title).toContain('Word')
  })

  it('covers spreadsheets, presentations and archives', () => {
    expect(unsupportedHint(node({ extension: 'xlsx' })).title).toContain(
      'Excel',
    )
    expect(unsupportedHint(node({ extension: 'pptx' })).title).toContain(
      'PowerPoint',
    )
    expect(unsupportedHint(node({ extension: 'zip' })).title).toContain(
      'archive',
    )
    expect(unsupportedHint(node({ extension: 'heic' })).hint).toContain('HEIC')
  })

  it('gives a useful generic hint for unknown types', () => {
    const generic = unsupportedHint(
      node({ extension: 'weird', name: 'x.weird' }),
    )
    expect(generic.title).toBe('.WEIRD file')
    expect(generic.hint).toContain('Download')
    expect(generic.hint).toContain('PDF')
  })
})
