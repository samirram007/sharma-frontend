import { useSyncExternalStore } from 'react'

/**
 * Document clipboard: a module-level store (not component state) so a
 * copy/cut survives navigating away and back, tab switches and remounts —
 * previously the clipboard was `useState` inside DocumentsManager and was
 * wiped every time the component unmounted, which made "copy here, open
 * another folder, paste" impossible.
 *
 * Entries are added by the grid/tree context menus (copy / cut). The whole
 * multi-selection is captured at copy time, so pasting pastes everything
 * that was selected.
 *
 * Copy entries stay on the clipboard indefinitely — you can paste them any
 * number of times, into any number of folders, until you copy or cut
 * something else (which replaces the clipboard, like Windows Explorer).
 * Cut entries are one-shot: they are removed when pasted.
 *
 * Uses useSyncExternalStore (same pattern as appearance-store.ts) so the
 * toolbar hint and the paste menu item stay in sync everywhere.
 */
export type ClipboardMode = 'copy' | 'cut'

export interface ClipboardEntry {
  nodeId: number
  name: string
  kind: 'folder' | 'file' | 'shortcut'
  mode: ClipboardMode
}

interface ClipboardState {
  entries: ClipboardEntry[]
  mode: ClipboardMode
}

type Listener = () => void

let state: ClipboardState = { entries: [], mode: 'copy' }
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): ClipboardState {
  return state
}

/**
 * Fill the clipboard with nodes (the current selection). Replaces whatever
 * was there before — the clipboard holds exactly one batch at a time.
 */
function setEntries(
  nodes: Array<Pick<ClipboardEntry, 'nodeId' | 'name' | 'kind'>>,
  mode: ClipboardMode,
) {
  if (nodes.length === 0) return
  state = {
    entries: nodes.map((node) => ({ ...node, mode })),
    mode,
  }
  emit()
}

/** Cut is one-shot: drop every already-pasted entry from the clipboard. */
function removePasted(nodeIds: number[]) {
  const pasted = new Set(nodeIds)
  const remaining = state.entries.filter((entry) => !pasted.has(entry.nodeId))
  if (remaining.length === state.entries.length) return
  state = { ...state, entries: remaining }
  if (state.entries.length === 0) state = { entries: [], mode: 'copy' }
  emit()
}

function clear() {
  state = { entries: [], mode: 'copy' }
  emit()
}

/** Imperative API for non-React callers (menus, effects). */
export const documentClipboard = {
  set: setEntries,
  removePasted,
  clear,
  /** True when the clipboard currently holds anything. */
  has: () => state.entries.length > 0,
}

/** React hook — re-renders whenever the clipboard changes. */
export function useDocumentClipboard(): {
  entries: ClipboardEntry[]
  mode: ClipboardMode
  isEmpty: boolean
} {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  return {
    entries: snapshot.entries,
    mode: snapshot.mode,
    isEmpty: snapshot.entries.length === 0,
  }
}
