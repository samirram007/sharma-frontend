import { useEffect, useRef, type RefObject } from 'react'

/**
 * Scrolls a scrollable container back to the top when `isFetching` transitions
 * from `true` to `false` — i.e. right after a data fetch completes — so the
 * freshly imported rows are immediately visible.
 *
 * ```tsx
 * const listRef = useRef<HTMLDivElement>(null)
 * useScrollTopAfterFetch(listRef, isFetching)
 * // ...
 * <div ref={listRef} className='overflow-y-auto'>...</div>
 * ```
 */
export function useScrollTopAfterFetch(
  ref: RefObject<HTMLDivElement | null>,
  isFetching: boolean,
) {
  const wasFetchingRef = useRef(false)

  useEffect(() => {
    if (wasFetchingRef.current && !isFetching) {
      requestAnimationFrame(() => {
        ref.current?.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
    wasFetchingRef.current = isFetching
  }, [isFetching, ref])
}
