/**
 * Pure helpers for multi-select + batch conflict resolution. Kept free of
 * React and network code so they unit-test cheaply.
 */

// ── Marquee (area) selection geometry ────────────────────────────────────────

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** Axis-aligned rect between the two drag corners (negative drags included). */
export function marqueeRect(anchor: Point, current: Point): Rect {
  return {
    x: Math.min(anchor.x, current.x),
    y: Math.min(anchor.y, current.y),
    width: Math.abs(current.x - anchor.x),
    height: Math.abs(current.y - anchor.y),
  }
}

/** Intersection test with a small tolerance so edge-touching rows count. */
export function rectsIntersect(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width - 1 &&
    a.x + a.width > b.x + 1 &&
    a.y < b.y + b.height - 1 &&
    a.y + a.height > b.y + 1
  )
}

/** Viewport-space rect of a grid entry, for marquee hit-testing. */
export function nodeRectFromElement(element: Element): Rect | null {
  const bounds = element.getBoundingClientRect()
  if (bounds.width === 0 && bounds.height === 0) return null
  return {
    x: bounds.left,
    y: bounds.top,
    width: bounds.width,
    height: bounds.height,
  }
}

/**
 * A real marquee requires intent: a few pixels of travel, so plain clicks
 * never flash a selection rectangle.
 */
export function isMarqueeFarEnough(
  anchor: Point,
  current: Point,
  minDistance = 4,
): boolean {
  return (
    Math.abs(current.x - anchor.x) >= minDistance ||
    Math.abs(current.y - anchor.y) >= minDistance
  )
}

// ── Batch conflict resolution ────────────────────────────────────────────────

export type ConflictChoice = 'skip' | 'replace' | 'rename'

export interface ConflictDecision {
  /** Id of the node being moved/copied. */
  movedId: number
  choice: ConflictChoice
}

/**
 * Split a batch of decisions by choice. `applyToAll` mirrors the single
 * choice across every conflicted node in the batch (the dialog's checkbox).
 */
export function splitConflictDecisions(decisions: ConflictDecision[]): {
  replace: number[]
  rename: number[]
  skip: number[]
} {
  const bucket = (choice: ConflictChoice) =>
    decisions
      .filter((decision) => decision.choice === choice)
      .map((decision) => decision.movedId)

  return {
    replace: bucket('replace'),
    rename: bucket('rename'),
    skip: bucket('skip'),
  }
}

/**
 * Ids safe to move/copy into `targetId`. Per dragged item the rules are:
 *  - an item never moves into itself (it IS the target → stays put);
 *  - a folder never moves into its own subtree (target inside its proper
 *    descendants → skip that item, the rest of the batch still proceeds).
 *
 * Dragging a parent together with its child into an unrelated folder is
 * fine — descendants only matter relative to the target, not the batch.
 * `descendantsOf(id)` returns the PROPER descendants of that folder.
 */
export function filterDropIds(
  ids: number[],
  targetId: number | null,
  descendantsOf: (id: number) => Set<number>,
): number[] {
  if (targetId == null) return [...ids] // root accepts anything
  return ids.filter((id) => {
    if (id === targetId) return false // target stays where it is
    return !descendantsOf(id).has(targetId) // no folder into its own subtree
  })
}
