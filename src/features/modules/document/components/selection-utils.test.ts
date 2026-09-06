import { describe, expect, it } from 'vitest'
import {
  filterDropIds,
  isMarqueeFarEnough,
  marqueeRect,
  nodeRectFromElement,
  rectsIntersect,
  splitConflictDecisions,
  type ConflictDecision,
  type Point,
  type Rect,
} from './selection-utils'

// ── marqueeRect ──────────────────────────────────────────────────────────────

describe('marqueeRect', () => {
  it('builds a rect from corners dragged in any direction', () => {
    const downRight = marqueeRect({ x: 10, y: 10 }, { x: 60, y: 40 })
    expect(downRight).toEqual({ x: 10, y: 10, width: 50, height: 30 })

    const upLeft = marqueeRect({ x: 60, y: 40 }, { x: 10, y: 10 })
    expect(upLeft).toEqual({ x: 10, y: 10, width: 50, height: 30 })
  })

  it('handles zero-size drags', () => {
    const point: Point = { x: 5, y: 5 }
    expect(marqueeRect(point, point)).toEqual({
      x: 5,
      y: 5,
      width: 0,
      height: 0,
    })
  })
})

// ── rectsIntersect ───────────────────────────────────────────────────────────

describe('rectsIntersect', () => {
  const container: Rect = { x: 0, y: 0, width: 100, height: 50 }

  it('counts fully contained rects', () => {
    expect(
      rectsIntersect(container, { x: 10, y: 10, width: 5, height: 5 }),
    ).toBe(true)
  })

  it('counts partial overlaps and edge-grazes', () => {
    expect(
      rectsIntersect(container, { x: 95, y: 45, width: 20, height: 20 }),
    ).toBe(true)
    expect(
      rectsIntersect(container, { x: -5, y: -5, width: 8, height: 8 }),
    ).toBe(true)
  })

  it('rejects near misses and disjunct rects', () => {
    expect(
      rectsIntersect(container, { x: 102, y: 0, width: 5, height: 5 }),
    ).toBe(false)
    expect(
      rectsIntersect(container, { x: 0, y: 55, width: 5, height: 5 }),
    ).toBe(false)
    expect(
      rectsIntersect(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 50, y: 50, width: 5, height: 5 },
      ),
    ).toBe(false)
  })
})

// ── nodeRectFromElement ──────────────────────────────────────────────────────

describe('nodeRectFromElement', () => {
  it('maps a bounding box into viewport space', () => {
    const element = {
      getBoundingClientRect: () => ({
        left: 12,
        top: 34,
        width: 100,
        height: 20,
      }),
    } as unknown as Element
    expect(nodeRectFromElement(element)).toEqual({
      x: 12,
      y: 34,
      width: 100,
      height: 20,
    })
  })

  it('returns null for zero-size (hidden) elements', () => {
    const element = {
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
    } as unknown as Element
    expect(nodeRectFromElement(element)).toBeNull()
  })
})

// ── isMarqueeFarEnough ───────────────────────────────────────────────────────

describe('isMarqueeFarEnough', () => {
  it('requires a minimum travel before a marquee counts', () => {
    const anchor: Point = { x: 0, y: 0 }
    expect(isMarqueeFarEnough(anchor, { x: 5, y: 0 })).toBe(true)
    // Exactly the threshold counts (>= comparison) — only sub-threshold
    // jitter is treated as a plain click.
    expect(isMarqueeFarEnough(anchor, { x: 0, y: 4 })).toBe(true)
    expect(isMarqueeFarEnough(anchor, { x: 3, y: 3 })).toBe(false)
  })
})

// ── splitConflictDecisions ───────────────────────────────────────────────────

describe('splitConflictDecisions', () => {
  it('buckets decisions by choice', () => {
    const decisions: ConflictDecision[] = [
      { movedId: 1, choice: 'replace' },
      { movedId: 2, choice: 'rename' },
      { movedId: 3, choice: 'skip' },
      { movedId: 4, choice: 'replace' },
    ]
    expect(splitConflictDecisions(decisions)).toEqual({
      replace: [1, 4],
      rename: [2],
      skip: [3],
    })
  })

  it('handles empty batches', () => {
    expect(splitConflictDecisions([])).toEqual({
      replace: [],
      rename: [],
      skip: [],
    })
  })
})

// ── filterDropIds ────────────────────────────────────────────────────────────

describe('filterDropIds', () => {
  it('never drops a folder into its own subtree', () => {
    const descendantsOf = (id: number) =>
      id === 1 ? new Set([2, 3]) : new Set<number>()
    // Folder 1 dropped onto its own child 3 → filtered out.
    expect(filterDropIds([1], 3, descendantsOf)).toEqual([])
    // Unrelated target → fine.
    expect(filterDropIds([1], 9, descendantsOf)).toEqual([1])
  })

  it('excludes the target itself but the rest of the batch continues', () => {
    const descendantsOf = () => new Set<number>()
    expect(filterDropIds([1, 2, 3], 2, descendantsOf)).toEqual([1, 3])
  })

  it('root target accepts everything', () => {
    const descendantsOf = (id: number) =>
      id === 1 ? new Set([2]) : new Set<number>()
    expect(filterDropIds([1, 2], null, descendantsOf)).toEqual([1, 2])
  })

  it('dragging a parent together with its child into an unrelated folder works', () => {
    const descendantsOf = (id: number) =>
      id === 1 ? new Set([2]) : new Set<number>()
    expect(filterDropIds([1, 2], 9, descendantsOf)).toEqual([1, 2])
  })
})
