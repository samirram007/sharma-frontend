import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFullscreen } from './use-fullscreen'

// jsdom has no Fullscreen API — simulate it with a controllable
// document.fullscreenElement getter + dispatched fullscreenchange events,
// mirroring how real browsers behave.
let fullscreenElement: Element | null = null

beforeEach(() => {
  fullscreenElement = null
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    get: () => fullscreenElement,
  })
})

afterEach(() => {
  Reflect.deleteProperty(document, 'fullscreenElement')
  Reflect.deleteProperty(document, 'exitFullscreen')
  vi.restoreAllMocks()
})

/** requestFullscreen mock that flips the flag and fires the change event. */
function enterFullscreenMock(element: HTMLElement) {
  return vi.fn(async () => {
    fullscreenElement = element
    document.dispatchEvent(new Event('fullscreenchange'))
  })
}

/** exitFullscreen mock that clears the flag and fires the change event. */
function exitFullscreenMock() {
  return vi.fn(async () => {
    fullscreenElement = null
    document.dispatchEvent(new Event('fullscreenchange'))
  })
}

describe('useFullscreen', () => {
  it('is a safe no-op when the Fullscreen API is unavailable', () => {
    const { result } = renderHook(() => useFullscreen<HTMLDivElement>())

    expect(result.current.isFullscreen).toBe(false)
    expect(() => act(() => result.current.toggle())).not.toThrow()
    expect(result.current.isFullscreen).toBe(false)
  })

  it('requests fullscreen on toggle and tracks fullscreenchange', async () => {
    const { result } = renderHook(() => useFullscreen<HTMLDivElement>())
    const element = document.createElement('div')
    element.requestFullscreen = enterFullscreenMock(element)
    act(() => {
      result.current.ref.current = element
    })

    await act(async () => result.current.toggle())

    expect(element.requestFullscreen).toHaveBeenCalledTimes(1)
    expect(result.current.isFullscreen).toBe(true)
  })

  it('exits fullscreen on the second toggle', async () => {
    const { result } = renderHook(() => useFullscreen<HTMLDivElement>())
    const element = document.createElement('div')
    element.requestFullscreen = enterFullscreenMock(element)
    document.exitFullscreen = exitFullscreenMock()
    act(() => {
      result.current.ref.current = element
    })

    await act(async () => result.current.toggle())
    await act(async () => result.current.toggle())

    expect(document.exitFullscreen).toHaveBeenCalledTimes(1)
    expect(result.current.isFullscreen).toBe(false)
  })

  it('starts fullscreen-aware when the document is already fullscreen', () => {
    fullscreenElement = document.createElement('div')

    const { result } = renderHook(() => useFullscreen<HTMLDivElement>())
    expect(result.current.isFullscreen).toBe(true)
  })

  it('survives a rejected requestFullscreen without unhandled rejection', async () => {
    const { result } = renderHook(() => useFullscreen<HTMLDivElement>())
    const element = document.createElement('div')
    element.requestFullscreen = vi.fn(async () => {
      throw new Error('gesture required')
    })
    act(() => {
      result.current.ref.current = element
    })

    await act(async () => result.current.toggle())
    expect(result.current.isFullscreen).toBe(false)
  })
})
