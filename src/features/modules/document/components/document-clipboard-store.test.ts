import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  documentClipboard,
  useDocumentClipboard,
} from './document-clipboard-store'

// The clipboard is a module-level singleton — reset it between tests.
beforeEach(() => {
  act(() => {
    documentClipboard.clear()
  })
})

describe('document clipboard store', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useDocumentClipboard())
    expect(result.current.isEmpty).toBe(true)
    expect(result.current.entries).toEqual([])
  })

  it('holds a copied selection and keeps it until replaced (repeat paste)', () => {
    const { result } = renderHook(() => useDocumentClipboard())

    act(() => {
      documentClipboard.set(
        [
          { nodeId: 1, name: 'a.pdf', kind: 'file' },
          { nodeId: 2, name: 'Reports', kind: 'folder' },
        ],
        'copy',
      )
    })

    expect(result.current.entries).toHaveLength(2)
    expect(result.current.mode).toBe('copy')
    expect(result.current.isEmpty).toBe(false)

    // Pasting must NOT clear a copy — the entries remain for another paste.
    expect(result.current.entries).toHaveLength(2)
  })

  it('replaces the previous batch when something new is copied', () => {
    const { result } = renderHook(() => useDocumentClipboard())

    act(() => {
      documentClipboard.set(
        [{ nodeId: 1, name: 'a.pdf', kind: 'file' }],
        'copy',
      )
    })
    act(() => {
      documentClipboard.set(
        [{ nodeId: 9, name: 'b.txt', kind: 'file' }],
        'copy',
      )
    })

    expect(result.current.entries).toHaveLength(1)
    expect(result.current.entries[0].nodeId).toBe(9)
  })

  it('cut entries are removed one-shot after pasting', () => {
    const { result } = renderHook(() => useDocumentClipboard())

    act(() => {
      documentClipboard.set(
        [
          { nodeId: 1, name: 'a.pdf', kind: 'file' },
          { nodeId: 2, name: 'b.pdf', kind: 'file' },
        ],
        'cut',
      )
    })
    act(() => {
      documentClipboard.removePasted([1])
    })
    expect(result.current.entries.map((e) => e.nodeId)).toEqual([2])

    act(() => {
      documentClipboard.removePasted([2])
    })
    expect(result.current.isEmpty).toBe(true)
  })

  it('clear() empties the clipboard from the status hint', () => {
    const { result } = renderHook(() => useDocumentClipboard())

    act(() => {
      documentClipboard.set(
        [{ nodeId: 1, name: 'a.pdf', kind: 'file' }],
        'copy',
      )
    })
    act(() => {
      documentClipboard.clear()
    })

    expect(result.current.isEmpty).toBe(true)
    expect(documentClipboard.has()).toBe(false)
  })
})
