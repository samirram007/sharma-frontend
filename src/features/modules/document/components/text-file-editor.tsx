import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconArrowsDiagonal,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconBlockquote,
  IconBold,
  IconChevronDown,
  IconChevronUp,
  IconClipboard,
  IconCode,
  IconCopy,
  IconCut,
  IconEye,
  IconEyeOff,
  IconH1,
  IconH2,
  IconH3,
  IconIndentIncrease,
  IconItalic,
  IconLayoutColumns,
  IconLineHeight,
  IconLink,
  IconList,
  IconListNumbers,
  IconLoader2,
  IconMarkdown,
  IconMinus,
  IconPlus,
  IconSearch,
  IconSelectAll,
  IconStrikethrough,
  IconTextWrap,
  IconX,
} from '@tabler/icons-react'
import {
  createTextFileService,
  readTextFileService,
  updateTextFileService,
} from '../data/api'
import type { DocumentNode } from '../data/schema'
import { formatBytes } from '@/utils/format-num'

export type TextFileKind = 'md' | 'txt'

interface Props {
  /** Open with an existing text file (edit mode)… */
  node: DocumentNode | null
  /** …or with a kind to create a new one (parentId + names come from the manager). */
  newKind: TextFileKind | null
  parentId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEFAULT_CONTENT: Record<TextFileKind, string> = {
  md: '# Untitled\n\n',
  txt: '',
}

// ── Editor view preferences (persisted across sessions) ────────────────────

interface TextEditorPrefs {
  wordWrap: boolean
  showLineNumbers: boolean
  showPreview: boolean
  fontSize: number
}

const DEFAULT_EDITOR_PREFS: TextEditorPrefs = {
  wordWrap: true,
  showLineNumbers: true,
  showPreview: false,
  fontSize: 14,
}

const EDITOR_PREFS_KEY = 'text-editor-prefs'

/** Save-shortcut label matches the platform (⌘S on macOS, Ctrl+S elsewhere). */
const SAVE_MOD = /Mac|iPod|iPhone|iPad/.test(
  typeof navigator !== 'undefined' ? navigator.platform : '',
)
  ? '⌘'
  : 'Ctrl'

// ── Floating-window behavior (move / resize / maximize) ────────────────────

/** Position + size of the dialog, in viewport px (top-left origin). */
interface Bounds {
  x: number
  y: number
  w: number
  h: number
}

/** Smallest size the dialog can be resized to. */
const MIN_WIDTH = 560
const MIN_HEIGHT = 400

/**
 * True on-screen viewport (the visible area below the browser chrome).
 * `visualViewport` excludes the address bar / tab strip, so centering against
 * `innerHeight` alone can push a tall dialog's title bar behind the browser
 * UI. Falls back to `window` dimensions when `visualViewport` is unavailable.
 */
function viewport() {
  const vv = typeof window !== 'undefined' ? window.visualViewport : undefined
  const vw = vv?.width ?? window.innerWidth ?? 1280
  const vh = vv?.height ?? window.innerHeight ?? 800
  const topInset = vv?.offsetTop ?? 0
  return { vw, vh, topInset }
}

/** Restore the editor view toggles (falls back to defaults). */
function readStoredEditorPrefs(): TextEditorPrefs {
  try {
    const raw = localStorage.getItem(EDITOR_PREFS_KEY)
    if (!raw) return DEFAULT_EDITOR_PREFS
    return { ...DEFAULT_EDITOR_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_EDITOR_PREFS
  }
}

/** Persist the editor view toggles across reloads. */
function saveEditorPrefs(prefs: TextEditorPrefs) {
  try {
    localStorage.setItem(EDITOR_PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // Private mode / storage full — prefs just won't persist.
  }
}

// ── Markdown rendering ──────────────────────────────────────────────────────

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** One markdown line → inline HTML (bold, italic, strike, code, links). */
function renderInline(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    )
}

/**
 * Markdown → HTML with headings, bold/italic/strikethrough, inline code,
 * fenced code blocks, links, ordered/unordered/task lists, quotes and
 * horizontal rules. Escapes first, then builds HTML — output stays inert.
 */
function renderMarkdown(source: string): string {
  const lines = source.split('\n')
  const html: string[] = []
  let inList = false
  let ordered = false
  let inQuote = false
  let inCode = false
  const codeLines: string[] = []

  const closeList = () => {
    if (inList) {
      html.push(ordered ? '</ol>' : '</ul>')
      inList = false
    }
  }
  const closeQuote = () => {
    if (inQuote) {
      html.push('</blockquote>')
      inQuote = false
    }
  }

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      closeList()
      closeQuote()
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
        codeLines.length = 0
        inCode = false
      } else {
        inCode = true
      }
      continue
    }
    if (inCode) {
      codeLines.push(line)
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      closeList()
      closeQuote()
      const level = heading[1].length
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
      continue
    }
    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) {
      closeList()
      closeQuote()
      html.push('<hr />')
      continue
    }

    const ul = /^\s*[-*]\s+(.*)$/.exec(line)
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line)
    if (ul || ol) {
      closeQuote()
      const wantOrdered = ol != null
      if (!inList || ordered !== wantOrdered) {
        closeList()
        html.push(wantOrdered ? '<ol>' : '<ul>')
        inList = true
        ordered = wantOrdered
      }
      let itemText = (ul ?? ol)![1]
      const task = /^\[([ xX])\]\s+/.exec(itemText)
      if (task) {
        const checked = task[1] !== ' '
        itemText = itemText.replace(/^\[([ xX])\]\s+/, '')
        html.push(
          `<li><input type="checkbox" disabled${checked ? ' checked' : ''} /> ${renderInline(itemText)}</li>`,
        )
      } else {
        html.push(`<li>${renderInline(itemText)}</li>`)
      }
      continue
    }

    const quote = /^\s*>\s?(.*)$/.exec(line)
    if (quote) {
      closeList()
      if (!inQuote) {
        html.push('<blockquote>')
        inQuote = true
      }
      html.push(`<p>${renderInline(quote[1])}</p>`)
      continue
    }
    closeQuote()

    if (line.trim() === '') {
      html.push('')
      continue
    }
    html.push(`<p>${renderInline(line)}</p>`)
  }

  closeList()
  closeQuote()
  if (inCode)
    html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
  return html.join('\n')
}

// ── Selection transforms (toolbar + keyboard) ───────────────────────────────

interface SelectionResult {
  text: string
  start: number
  end: number
}

/** Wrap `text` in the marker pair; toggles off when already wrapped. */
function wrapSelection(
  text: string,
  start: number,
  end: number,
  marker: string,
): SelectionResult {
  const selected = text.slice(start, end)
  if (
    text.slice(start - marker.length, start) === marker &&
    text.slice(end, end + marker.length) === marker
  ) {
    return {
      text:
        text.slice(0, start - marker.length) +
        selected +
        text.slice(end + marker.length),
      start: start - marker.length,
      end: end - marker.length,
    }
  }
  return {
    text: `${text.slice(0, start)}${marker}${selected}${marker}${text.slice(end)}`,
    start: start + marker.length,
    end: end + marker.length,
  }
}

/** Prefix each selected line; toggles off when every line already has it. */
function prefixLines(
  text: string,
  start: number,
  end: number,
  prefix: string | ((index: number) => string),
): SelectionResult {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  let lineEnd = text.indexOf('\n', end)
  if (lineEnd === -1) lineEnd = text.length
  const lines = text.slice(lineStart, lineEnd).split('\n')

  const resolved = lines.map((_, index) =>
    typeof prefix === 'function' ? prefix(index) : prefix,
  )
  const allPrefixed = lines.every(
    (line, index) => line.length === 0 || line.startsWith(resolved[index]),
  )
  const nextLines = allPrefixed
    ? lines.map((line, index) => line.slice(resolved[index].length))
    : lines.map((line, index) =>
        line.length === 0 || line.startsWith(resolved[index])
          ? line
          : resolved[index] + line,
      )
  const next = `${text.slice(0, lineStart)}${nextLines.join('\n')}${text.slice(lineEnd)}`
  const delta = next.length - text.length
  return {
    text: next,
    start: Math.max(lineStart, start + delta),
    end: Math.max(lineStart, end + delta),
  }
}

/** Insert `snippet` at the cursor, replacing any selection. */
function insertSnippet(
  text: string,
  start: number,
  end: number,
  snippet: string,
): SelectionResult {
  return {
    text: `${text.slice(0, start)}${snippet}${text.slice(end)}`,
    start: start + snippet.length,
    end: start + snippet.length,
  }
}

// ── Find/replace + misc helpers ────────────────────────────────────────────

/** Collect every (case-insensitive) start index of `query` in `text`. */
function computeFindMatches(text: string, query: string): number[] {
  if (!query) return []
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const matches: number[] = []
  let index = 0
  while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
    matches.push(index)
    index += lowerQuery.length
  }
  return matches
}

/** Escape regex metacharacters so a user query is treated literally. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Format an ISO date string for the file-info strip. */
function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/**
 * Layout-relevant text properties copied from the textarea onto the hidden
 * measuring mirror — if any of them differs, wrapped line heights drift and
 * the gutter numbers stop lining up with the text (the textarea's UA/global
 * styles enable e.g. overflow-wrap: break-word, which plain pre-wrap lacks).
 */
const MEASURED_TEXT_PROPERTIES = [
  'fontSize',
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'fontVariant',
  'lineHeight',
  'letterSpacing',
  'wordSpacing',
  'textTransform',
  'tabSize',
  'whiteSpace',
  'overflowWrap',
  'wordBreak',
  'hyphens',
] as const

// ── Component ───────────────────────────────────────────────────────────────

/**
 * Text/markdown editor: create (newKind) or edit (node) md/txt files.
 * Wide two-pane layout with a formatting toolbar (headings, bold/italic/
 * strike, inline code, lists, quote, rule, link), live markdown preview
 * (split or full), word-wrap and line-number options, Tab indent and
 * Ctrl/Cmd+S save. Saves via the DocumentManager text endpoints; invalidates
 * the document queries so grids refresh immediately.
 */
export function TextFileEditor({
  node,
  newKind,
  parentId,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient()
  const isCreate = newKind != null
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  // View toggles persist across sessions (localStorage); fullPreview is
  // transient — every open starts in split view so the editor is visible.
  const [storedPrefs] = useState(readStoredEditorPrefs)
  const [showPreview, setShowPreview] = useState(storedPrefs.showPreview)
  const [fullPreview, setFullPreview] = useState(false)
  const [wordWrap, setWordWrap] = useState(storedPrefs.wordWrap)
  const [showLineNumbers, setShowLineNumbers] = useState(
    storedPrefs.showLineNumbers,
  )
  /** Editor font size (px) — the gutter and textarea share it so lines align. */
  const [fontSize, setFontSize] = useState(storedPrefs.fontSize)
  const editorLineHeight = Math.round((fontSize * 20) / 14)
  /** Indentation width for the Tab key (2 / 4 / 8 spaces). */
  const [tabSize, setTabSize] = useState(2)
  /** Undo/redo history of content snapshots (cap the undo stack). */
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  /** Find & replace bar state. */
  const [findOpen, setFindOpen] = useState(false)
  const [findQuery, setFindQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [findIndex, setFindIndex] = useState(0)
  const findRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  /** Line-number gutter — translated in lockstep with the textarea. */
  const gutterInnerRef = useRef<HTMLDivElement>(null)
  /** Hidden element used to measure each logical line's wrapped height. */
  const measureRef = useRef<HTMLDivElement>(null)
  /** Visual top (px, relative to content box) of each logical line. */
  const [lineTops, setLineTops] = useState<number[]>([])
  /** Index of the logical line under the caret — highlights its number. */
  const [caretLine, setCaretLine] = useState(0)
  /**
   * Read the caret's logical line straight off the textarea (the live value,
   * not a state snapshot) — call it after any programmatic selection change.
   */
  const syncCaretLine = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    setCaretLine(
      textarea.value.slice(0, textarea.selectionStart).split('\n').length - 1,
    )
  }, [])
  /** Saved baseline to diff against for the unsaved-changes guard. */
  const [baseline, setBaseline] = useState<{ name: string; content: string }>({
    name: '',
    content: '',
  })
  /** Pending close awaiting the discard-confirmation answer. */
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  /** Floating-window state: maximized fills the screen; bounds is null until
      the user first drags/resizes, after which it becomes the dialog's
      top-left position + size (viewport px). */
  const [maximized, setMaximized] = useState(false)
  const [bounds, setBounds] = useState<Bounds | null>(null)

  /** Centered default bounds — the pre-drag layout (5xl × ~88vh). */
  const defaultBounds = useCallback((): Bounds => {
    const { vw, vh, topInset } = viewport()
    const margin = 24
    const w = Math.min(1024, vw - margin * 2)
    const h = Math.min(
      Math.round(vh * (vw < 640 ? 0.92 : 0.88)),
      vh - margin * 2,
    )
    return {
      x: Math.round((vw - w) / 2),
      // Clamp the top so the title bar never sits behind the browser chrome.
      y: Math.round(topInset + Math.max(margin, (vh - h) / 2)),
      w,
      h,
    }
  }, [])

  /** Bounds to use right now: the user-set one, or the centered default. */
  const currentBounds = useCallback(
    () => bounds ?? defaultBounds(),
    [bounds, defaultBounds],
  )

  /**
   * Shared pointer-drag plumbing: captures the pointer, then calls `apply`
   * with the original bounds and the total pointer delta on every move.
   * Listeners live on window so fast drags that leave the dialog keep
   * tracking; they are removed on pointerup/cancel.
   */
  const startDrag = useCallback(
    (
      event: ReactPointerEvent<HTMLElement>,
      apply: (origin: Bounds, dx: number, dy: number) => Bounds,
    ) => {
      if (maximized || event.button !== 0) return
      event.preventDefault()
      event.currentTarget.setPointerCapture?.(event.pointerId)
      const origin = currentBounds()
      const startX = event.clientX
      const startY = event.clientY
      const onMove = (move: PointerEvent) => {
        setBounds(apply(origin, move.clientX - startX, move.clientY - startY))
      }
      const onEnd = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onEnd)
        window.removeEventListener('pointercancel', onEnd)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onEnd)
      window.addEventListener('pointercancel', onEnd)
    },
    [maximized, currentBounds],
  )

  /** Drag the dialog by its header (keeps part of it on screen). */
  const startHeaderDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Never start a drag from a control inside the header (maximize button).
      if ((event.target as HTMLElement).closest('button')) return
      startDrag(event, (origin, dx, dy) => {
        const { vw, vh, topInset } = viewport()
        return {
          ...origin,
          x: Math.min(Math.max(origin.x + dx, -origin.w + 80), vw - 80),
          // Keep the header (drag handle) on the visible viewport.
          y: Math.min(Math.max(origin.y + dy, topInset), topInset + vh - 56),
        }
      })
    },
    [startDrag],
  )

  /** Resize the dialog from the bottom-right corner handle. */
  const startCornerResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.stopPropagation()
      startDrag(event, (origin, dx, dy) => {
        const { vw, vh } = viewport()
        return {
          ...origin,
          w: Math.min(Math.max(MIN_WIDTH, origin.w + dx), vw - 16),
          h: Math.min(Math.max(MIN_HEIGHT, origin.h + dy), vh - 16),
        }
      })
    },
    [startDrag],
  )

  const effectiveName = isCreate ? name : (node?.name ?? '')
  const extension = useMemo(() => {
    const match = /\.([a-z0-9]+)$/i.exec(effectiveName)
    return (match?.[1] ?? '').toLowerCase()
  }, [effectiveName])
  const isMarkdown = extension === 'md'

  // ── Content history (undo/redo) ──────────────────────────────────────────
  // Every edit funnels through commitContent, which snapshots the previous
  // content onto the undo stack (clearing redo). Undo/redo pop between stacks
  // and write the content directly so they are not themselves recorded.
  const commitContent = (next: string) => {
    if (content === next) return
    setUndoStack((stack) => [...stack.slice(-99), content])
    setRedoStack([])
    setContent(next)
  }
  const undo = () => {
    if (undoStack.length === 0) return
    const previous = undoStack[undoStack.length - 1]
    setUndoStack((stack) => stack.slice(0, -1))
    setRedoStack((stack) => [...stack, content])
    setContent(previous)
    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(previous.length, previous.length)
        syncCaretLine()
      }
    })
  }
  const redo = () => {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setRedoStack((stack) => stack.slice(0, -1))
    setUndoStack((stack) => [...stack, content])
    setContent(next)
    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(next.length, next.length)
        syncCaretLine()
      }
    })
  }

  // Reset/load when the dialog opens.
  useEffect(() => {
    if (!open) return
    if (isCreate) {
      const initialName = newKind === 'md' ? 'Untitled.md' : 'Untitled.txt'
      const initialContent = DEFAULT_CONTENT[newKind ?? 'txt']
      setName(initialName)
      setContent(initialContent)
      setBaseline({ name: initialName, content: initialContent })
      setUndoStack([])
      setRedoStack([])
      setFindOpen(false)
      setFindQuery('')
      setReplaceQuery('')
      setCaretLine(0)
      return
    }
    if (!node) return
    setLoading(true)
    readTextFileService(node.id)
      .then((response) => {
        const loaded = (response?.data?.content as string) ?? ''
        setContent(loaded)
        setUndoStack([])
        setRedoStack([])
        setFindOpen(false)
        setFindQuery('')
        setReplaceQuery('')
        setCaretLine(0)
        // The server copy is the saved baseline — opening a file and closing
        // it without edits never triggers the discard prompt.
        setBaseline({ name: node.name, content: loaded })
      })
      .catch(() => {
        toast.error('Could not load the file content.')
        onOpenChange(false)
      })
      .finally(() => setLoading(false))
  }, [open, node, isCreate, newKind, onOpenChange])

  // Persist view toggles whenever they change.
  useEffect(() => {
    saveEditorPrefs({ wordWrap, showLineNumbers, showPreview, fontSize })
  }, [wordWrap, showLineNumbers, showPreview, fontSize])

  // Keep the line-number gutter in lockstep with the textarea's vertical
  // scroll: the gutter is overflow-hidden and the line numbers are translated
  // by -scrollTop (rather than syncing scrollTop, which clamps when the
  // gutter's content doesn't overflow — e.g. long wrapped lines). Both share
  // the same line-height + top padding so the numbers stay aligned. `loading`
  // is in the deps because the textarea only mounts after content loads;
  // without it the listener attaches to a stale element and never follows.
  useEffect(() => {
    const textarea = textareaRef.current
    if (!open || !showLineNumbers || !textarea) return
    const sync = () => {
      if (gutterInnerRef.current) {
        gutterInnerRef.current.style.transform = `translateY(${-textarea.scrollTop}px)`
      }
    }
    sync()
    textarea.addEventListener('scroll', sync)
    return () => textarea.removeEventListener('scroll', sync)
  }, [open, showLineNumbers, loading])

  // Measure the visual top of each logical line so the gutter numbers line up
  // with wrapped text (a long line can occupy several visual rows). Without
  // wrap each line is exactly editorLineHeight; with wrap we mirror the
  // textarea's metrics in a hidden element and measure each line's height.
  // A ResizeObserver re-measures when the editor width changes (e.g. toggling
  // the markdown preview changes the editor's width, shifting wrap points).
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    const measure = measureRef.current
    if (!open || !showLineNumbers || !textarea || !measure) return

    const measureLines = () => {
      const lines = content.split('\n')
      if (!wordWrap) {
        setLineTops(lines.map((_, index) => index * editorLineHeight))
        return
      }
      const style = getComputedStyle(textarea)
      const paddingX =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      // Copy every layout-relevant text property from the textarea — the
      // mirror must wrap text EXACTLY like the textarea or the measured
      // heights drift and the numbers overlap further down the file.
      for (const property of MEASURED_TEXT_PROPERTIES) {
        const cssName = property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
        measure.style.setProperty(cssName, style.getPropertyValue(cssName))
      }
      measure.style.width = `${Math.max(0, textarea.clientWidth - paddingX)}px`
      measure.style.padding = '0'
      measure.style.border = '0'
      const tops: number[] = []
      let acc = 0
      for (const line of lines) {
        tops.push(acc)
        // A trailing \r (CRLF files) is not a CSS line break — drop it so it
        // can't skew the measured width.
        measure.textContent = line.replace(/\r$/, '') || ' '
        acc += measure.offsetHeight
      }
      setLineTops(tops)
    }

    measureLines()
    const observer = new ResizeObserver(() => measureLines())
    observer.observe(textarea)
    return () => observer.disconnect()
  }, [open, showLineNumbers, content, wordWrap, fontSize])

  /**
   * Unsaved-changes guard: true once content (or a new file's name) differs
   * from the last saved baseline. Compared against the trimmed name so a
   * stray space in the field does not count as a change.
   */
  const isDirty =
    content !== baseline.content ||
    (isCreate && name.trim() !== baseline.name.trim())

  // ── Apply a selection transform through the textarea ──
  const applyTransform = useCallback(
    (
      transform: (text: string, start: number, end: number) => SelectionResult,
    ) => {
      const textarea = textareaRef.current
      if (!textarea) return
      const { selectionStart, selectionEnd } = textarea
      const result = transform(content, selectionStart, selectionEnd)
      commitContent(result.text)
      // Restore focus/selection after React commits the new value.
      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(result.start, result.end)
        syncCaretLine()
      })
    },
    [content, commitContent, syncCaretLine],
  )

  const wrapWith = useCallback(
    (marker: string) =>
      applyTransform((text, start, end) =>
        wrapSelection(text, start, end, marker),
      ),
    [applyTransform],
  )
  const prefixWith = useCallback(
    (prefix: string | ((index: number) => string)) =>
      applyTransform((text, start, end) =>
        prefixLines(text, start, end, prefix),
      ),
    [applyTransform],
  )
  const insertLink = useCallback(() => {
    applyTransform((text, start, end) => {
      const selected = text.slice(start, end)
      const label = selected || 'label'
      return {
        text: `${text.slice(0, start)}[${label}](https://)${text.slice(end)}`,
        start: start + 1,
        end: start + 1 + label.length,
      }
    })
  }, [applyTransform])

  // ── Editor tools: find & replace, copy all, tab width ───────────────────
  const findMatches = useMemo(
    () => (findOpen && findQuery ? computeFindMatches(content, findQuery) : []),
    [findOpen, findQuery, content],
  )

  // Clamp the active match index whenever the match list changes.
  useEffect(() => {
    setFindIndex((index) =>
      findMatches.length === 0 ? 0 : Math.min(index, findMatches.length - 1),
    )
  }, [findMatches])

  const goToMatch = useCallback(
    (index: number) => {
      const textarea = textareaRef.current
      if (!textarea || findMatches.length === 0) return
      const safeIndex =
        ((index % findMatches.length) + findMatches.length) % findMatches.length
      setFindIndex(safeIndex)
      const start = findMatches[safeIndex]
      const end = start + findQuery.length
      textarea.focus()
      textarea.setSelectionRange(start, end)
      // Roughly scroll the matched line into view (the scroll event then
      // re-syncs the line-number gutter) and highlight its number.
      const line = content.slice(0, start).split('\n').length - 1
      setCaretLine(line)
      textarea.scrollTop = Math.max(
        0,
        line * editorLineHeight - textarea.clientHeight / 2,
      )
    },
    [findMatches, findQuery, content, editorLineHeight],
  )
  const nextMatch = useCallback(
    () => goToMatch(findIndex + 1),
    [goToMatch, findIndex],
  )
  const prevMatch = useCallback(
    () => goToMatch(findIndex - 1),
    [goToMatch, findIndex],
  )

  const replaceCurrent = () => {
    if (!findQuery || findMatches.length === 0) return
    const start = findMatches[findIndex]
    const end = start + findQuery.length
    const next = content.slice(0, start) + replaceQuery + content.slice(end)
    commitContent(next)
    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      const caret = start + replaceQuery.length
      textarea.focus()
      textarea.setSelectionRange(caret, caret)
      syncCaretLine()
    })
  }

  const replaceAll = () => {
    if (!findQuery) return
    const next = content.replace(
      new RegExp(escapeRegExp(findQuery), 'gi'),
      () => replaceQuery,
    )
    commitContent(next)
  }

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success('Copied the file content.')
    } catch {
      toast.error('Could not copy to clipboard.')
    }
  }

  // ── Selection + clipboard actions (used by the textarea context menu) ─────
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 })
  const hasSelection = selectionRange.start !== selectionRange.end

  const copySelection = () => {
    if (!hasSelection) return
    void navigator.clipboard.writeText(
      content.slice(selectionRange.start, selectionRange.end),
    )
  }

  const cutSelection = () => {
    const textarea = textareaRef.current
    if (!textarea || !hasSelection) return
    const { start, end } = selectionRange
    void navigator.clipboard.writeText(content.slice(start, end))
    commitContent(content.slice(0, start) + content.slice(end))
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start)
      syncCaretLine()
    })
  }

  const pasteClipboard = async () => {
    const textarea = textareaRef.current
    if (!textarea) return
    try {
      const text = await navigator.clipboard.readText()
      if (!text) return
      const { start, end } = selectionRange
      commitContent(content.slice(0, start) + text + content.slice(end))
      requestAnimationFrame(() => {
        textarea.focus()
        const caret = start + text.length
        textarea.setSelectionRange(caret, caret)
        syncCaretLine()
      })
    } catch {
      toast.error('Clipboard access was denied.')
    }
  }

  const selectAll = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.focus()
    textarea.setSelectionRange(0, content.length)
  }

  const cycleTabSize = () =>
    setTabSize((size) => (size === 2 ? 4 : size === 4 ? 8 : 2))

  const openFind = () => {
    setFindOpen(true)
    requestAnimationFrame(() => findRef.current?.focus())
  }

  // Ctrl/Cmd+F opens the find bar while the dialog is open.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        openFind()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Markdown editing shortcuts on the textarea: Ctrl/Cmd+B, I and K.
  useEffect(() => {
    const textarea = textareaRef.current
    if (!open || !isMarkdown || !textarea) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      const key = event.key.toLowerCase()
      if (key === 'b') {
        event.preventDefault()
        wrapWith('**')
      } else if (key === 'i') {
        event.preventDefault()
        wrapWith('*')
      } else if (key === 'k') {
        event.preventDefault()
        insertLink()
      }
    }
    textarea.addEventListener('keydown', onKeyDown)
    return () => textarea.removeEventListener('keydown', onKeyDown)
  }, [open, isMarkdown, wrapWith, insertLink])

  const save = async () => {
    if (isCreate) {
      const trimmed = name.trim()
      if (!trimmed) {
        toast.error('Give the file a name first.')
        return
      }
      const finalName = /\.[a-z0-9]+$/i.test(trimmed)
        ? trimmed
        : `${trimmed}.${newKind}`
      setSaving(true)
      try {
        await createTextFileService({
          name: finalName,
          content,
          parentId,
        })
        toast.success(`Created "${finalName}".`)
        void queryClient.invalidateQueries({ queryKey: ['document-manager'] })
        onOpenChange(false)
      } catch {
        // dataClient already toasts the server message (e.g. name conflict).
      } finally {
        setSaving(false)
      }
      return
    }
    if (!node) return
    setSaving(true)
    try {
      await updateTextFileService(node.id, content)
      toast.success(`Saved "${node.name}".`)
      void queryClient.invalidateQueries({ queryKey: ['document-manager'] })
      setBaseline({ name: node.name, content })
      onOpenChange(false)
    } catch {
      // dataClient already toasts the server message.
    } finally {
      setSaving(false)
    }
  }

  // Ctrl/Cmd+S saves from anywhere inside the dialog.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        // While the discard prompt is up, Ctrl+S means "keep editing and
        // save" — dismiss the prompt instead of saving underneath it.
        if (confirmDiscard) {
          setConfirmDiscard(false)
          return
        }
        if (!saving && !loading) void save()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // save closes over the current name/content; resubscribe each render.
  })

  /**
   * Close request funnel — every close path (Cancel button, ✕, Escape,
   * outside click) goes through here. Only asks when there are unsaved
   * changes; otherwise closes directly.
   */
  const requestClose = () => {
    if (!isDirty || saving || loading) {
      onOpenChange(false)
      return
    }
    setConfirmDiscard(true)
  }

  const wordCount = useMemo(
    () => (content.trim() ? content.trim().split(/\s+/).length : 0),
    [content],
  )
  const lineCount = content ? content.split('\n').length : 0

  interface ToolbarItem {
    key: string
    title: string
    icon: ReactNode
    onClick: () => void
  }

  const markdownGroups: ToolbarItem[][] = [
    [
      {
        key: 'h1',
        title: 'Heading 1 (# )',
        icon: <IconH1 className="h-4 w-4" />,
        onClick: () => prefixWith('# '),
      },
      {
        key: 'h2',
        title: 'Heading 2 (## )',
        icon: <IconH2 className="h-4 w-4" />,
        onClick: () => prefixWith('## '),
      },
      {
        key: 'h3',
        title: 'Heading 3 (### )',
        icon: <IconH3 className="h-4 w-4" />,
        onClick: () => prefixWith('### '),
      },
    ],
    [
      {
        key: 'bold',
        title: 'Bold (Ctrl+B)',
        icon: <IconBold className="h-4 w-4" />,
        onClick: () => wrapWith('**'),
      },
      {
        key: 'italic',
        title: 'Italic (Ctrl+I)',
        icon: <IconItalic className="h-4 w-4" />,
        onClick: () => wrapWith('*'),
      },
      {
        key: 'strike',
        title: 'Strikethrough (~~)',
        icon: <IconStrikethrough className="h-4 w-4" />,
        onClick: () => wrapWith('~~'),
      },
      {
        key: 'code',
        title: 'Inline code (`)',
        icon: <IconCode className="h-4 w-4" />,
        onClick: () => wrapWith('`'),
      },
      {
        key: 'link',
        title: 'Link (Ctrl+K)',
        icon: <IconLink className="h-4 w-4" />,
        onClick: insertLink,
      },
    ],
    [
      {
        key: 'ul',
        title: 'Bullet list (- )',
        icon: <IconList className="h-4 w-4" />,
        onClick: () => prefixWith('- '),
      },
      {
        key: 'ol',
        title: 'Numbered list (1. )',
        icon: <IconListNumbers className="h-4 w-4" />,
        onClick: () => prefixWith((index) => `${index + 1}. `),
      },
      {
        key: 'quote',
        title: 'Quote (> )',
        icon: <IconBlockquote className="h-4 w-4" />,
        onClick: () => prefixWith('> '),
      },
      {
        key: 'hr',
        title: 'Horizontal rule (---)',
        icon: <IconMinus className="h-4 w-4" />,
        onClick: () =>
          applyTransform((text, start, end) =>
            insertSnippet(text, start, end, '\n\n---\n\n'),
          ),
      },
    ],
  ]

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => next || requestClose()}>
        <DialogContent
          className="flex flex-col gap-3 overflow-hidden"
          style={
            maximized
              ? {
                  inset: 4,
                  width: 'auto',
                  height: 'auto',
                  maxWidth: 'none',
                  // The base dialog centers via translate-x/y-[-50%] (native
                  // `translate` property); neutralize it so `inset` alone
                  // positions the maximized box edge-to-edge.
                  translate: '0 0',
                }
              : {
                  left: currentBounds().x,
                  top: currentBounds().y,
                  width: currentBounds().w,
                  height: currentBounds().h,
                  maxWidth: 'none',
                  // Same as above — without clearing `translate`, the dialog
                  // is shifted up-left by half its size (title hidden).
                  translate: '0 0',
                }
          }
        >
          <DialogHeader
            className="cursor-move touch-none"
            onPointerDown={startHeaderDrag}
          >
            <DialogTitle className="flex items-center gap-2">
              <IconMarkdown className="h-4 w-4" />
              <span className="truncate">
                {isCreate
                  ? `New ${newKind?.toUpperCase() ?? ''} file`
                  : `Edit ${node?.name}`}
              </span>
              {/* Dirty dot — macOS-style unsaved-changes marker; opacity
                  (not mounting) keeps the title from shifting. */}
              <span
                aria-hidden={!isDirty}
                aria-label={isDirty ? 'Unsaved changes' : undefined}
                title={isDirty ? 'Unsaved changes' : undefined}
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full bg-amber-500 transition-opacity',
                  isDirty ? 'opacity-100' : 'opacity-0',
                )}
              />
              <span className="ml-auto flex items-center gap-1.5 pr-12 text-xs font-normal text-muted-foreground">
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">
                  {SAVE_MOD} S
                </kbd>
                to save
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground"
                  title={maximized ? 'Restore size' : 'Maximize'}
                  aria-label={maximized ? 'Restore size' : 'Maximize'}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setMaximized((value) => !value)}
                >
                  {maximized ? (
                    <IconArrowsMinimize className="h-4 w-4" />
                  ) : (
                    <IconArrowsMaximize className="h-4 w-4" />
                  )}
                </Button>
              </span>
            </DialogTitle>
            <DialogDescription>
              {isMarkdown
                ? 'Markdown — toolbar, live preview, Ctrl/Cmd+S to save.'
                : 'Plain text — changes save directly to the file.'}
            </DialogDescription>
          </DialogHeader>

          {isCreate && (
            <div className="space-y-1.5">
              <Label htmlFor="text-file-name">File name</Label>
              <Input
                id="text-file-name"
                ref={nameRef}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={newKind === 'md' ? 'notes.md' : 'notes.txt'}
                autoFocus
              />
            </div>
          )}

          {loading ? (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <IconLoader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <>
              {/* Toolbar — two deliberate rows so narrow dialogs never squeeze
                  or wrap controls into clipped leftovers: formatting (markdown
                  only, horizontally scrollable) above the view options. */}
              <div className="flex min-w-0 flex-col gap-1.5">
                {isMarkdown && (
                  <div className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-md border bg-muted/30 p-1">
                    {markdownGroups.map((group, groupIndex) => (
                      <div
                        key={`group-${groupIndex}`}
                        className="flex shrink-0 items-center gap-1"
                      >
                        {groupIndex > 0 && (
                          <Separator
                            orientation="vertical"
                            className="mx-1 h-5"
                          />
                        )}
                        {group.map((item) => (
                          <Button
                            key={item.key}
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            title={item.title}
                            aria-label={item.title}
                            onClick={item.onClick}
                          >
                            {item.icon}
                          </Button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex min-w-0 flex-wrap items-center gap-1">
                  <Button
                    type="button"
                    variant={wordWrap ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    title="Toggle word wrap"
                    onClick={() => setWordWrap((value) => !value)}
                  >
                    <IconTextWrap className="h-4 w-4" />
                    Wrap
                  </Button>
                  <Button
                    type="button"
                    variant={showLineNumbers ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    title="Toggle line numbers"
                    onClick={() => setShowLineNumbers((value) => !value)}
                  >
                    <IconLineHeight className="h-4 w-4" />
                    Lines
                  </Button>
                  <Separator orientation="vertical" className="mx-1 h-5" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 shrink-0"
                    title="Decrease font size"
                    aria-label="Decrease font size"
                    disabled={fontSize <= 10}
                    onClick={() =>
                      setFontSize((size) => Math.max(10, size - 1))
                    }
                  >
                    <IconMinus className="h-4 w-4" />
                  </Button>
                  <span className="px-0.5 text-xs tabular-nums text-muted-foreground">
                    {fontSize}px
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 shrink-0"
                    title="Increase font size"
                    aria-label="Increase font size"
                    disabled={fontSize >= 24}
                    onClick={() =>
                      setFontSize((size) => Math.min(24, size + 1))
                    }
                  >
                    <IconPlus className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="mx-1 h-5" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 shrink-0"
                    title="Undo (Ctrl+Z)"
                    aria-label="Undo"
                    disabled={undoStack.length === 0}
                    onClick={undo}
                  >
                    <IconArrowBackUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 shrink-0"
                    title="Redo (Ctrl+Y)"
                    aria-label="Redo"
                    disabled={redoStack.length === 0}
                    onClick={redo}
                  >
                    <IconArrowForwardUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 shrink-0"
                    title="Copy all content"
                    aria-label="Copy all content"
                    onClick={() => void copyAll()}
                  >
                    <IconCopy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={findOpen ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    title="Find & replace (Ctrl+F)"
                    onClick={openFind}
                  >
                    <IconSearch className="h-4 w-4" />
                    Find
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    title="Tab width (2 / 4 / 8 spaces)"
                    onClick={cycleTabSize}
                  >
                    <IconIndentIncrease className="h-4 w-4" />
                    Tab {tabSize}
                  </Button>
                  {isMarkdown && (
                    <>
                      <Separator orientation="vertical" className="mx-1 h-5" />
                      <Button
                        type="button"
                        variant={showPreview ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => setShowPreview((value) => !value)}
                      >
                        {showPreview ? (
                          <IconEyeOff className="h-4 w-4" />
                        ) : (
                          <IconEye className="h-4 w-4" />
                        )}
                        Preview
                      </Button>
                      {showPreview && (
                        <Button
                          type="button"
                          variant={fullPreview ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 gap-1.5 text-xs"
                          title={
                            fullPreview
                              ? 'Back to split view'
                              : 'Full-width preview'
                          }
                          onClick={() => setFullPreview((value) => !value)}
                        >
                          <IconLayoutColumns className="h-4 w-4" />
                          {fullPreview ? 'Split' : 'Full'}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Find & replace bar — Ctrl+F, navigates/selects matches. */}
              {findOpen && (
                <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-muted/30 p-1.5">
                  <Input
                    ref={findRef}
                    value={findQuery}
                    onChange={(event) => setFindQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        nextMatch()
                      } else if (event.key === 'Escape') {
                        setFindOpen(false)
                      }
                    }}
                    placeholder="Find"
                    className="h-6 w-36 text-xs"
                  />
                  <span className="px-1 text-xs tabular-nums text-muted-foreground">
                    {findMatches.length > 0
                      ? `${findIndex + 1}/${findMatches.length}`
                      : '0/0'}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 shrink-0"
                    title="Previous match"
                    aria-label="Previous match"
                    disabled={findMatches.length === 0}
                    onClick={prevMatch}
                  >
                    <IconChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 shrink-0"
                    title="Next match"
                    aria-label="Next match"
                    disabled={findMatches.length === 0}
                    onClick={nextMatch}
                  >
                    <IconChevronDown className="h-4 w-4" />
                  </Button>
                  <Input
                    value={replaceQuery}
                    onChange={(event) => setReplaceQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        replaceCurrent()
                      } else if (event.key === 'Escape') {
                        setFindOpen(false)
                      }
                    }}
                    placeholder="Replace"
                    className="h-6 w-36 text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1.5 text-xs"
                    title="Replace current match"
                    disabled={findMatches.length === 0}
                    onClick={replaceCurrent}
                  >
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1.5 text-xs"
                    title="Replace all matches"
                    disabled={!findQuery}
                    onClick={replaceAll}
                  >
                    All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 shrink-0"
                    title="Close find & replace"
                    aria-label="Close find & replace"
                    onClick={() => setFindOpen(false)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* File context strip — name, size, updated, owner. */}
              {!loading && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {effectiveName}
                  </span>
                  {node ? (
                    <>
                      {node.sizeBytes != null && (
                        <span>{formatBytes(node.sizeBytes)}</span>
                      )}
                      {node.updatedAt && (
                        <span>Updated {formatDate(node.updatedAt)}</span>
                      )}
                      {node.ownerName && <span>Owner {node.ownerName}</span>}
                    </>
                  ) : (
                    <span>New file — not saved yet</span>
                  )}
                </div>
              )}

              {/* Editor + preview surface — min-w-0 through the whole flex
                  chain so long unwrapped lines scroll inside the textarea
                  instead of forcing the dialog wide. */}
              <div className="relative flex min-h-0 min-w-0 flex-1 gap-3">
                {/* Hidden measuring element — mirrors the textarea so wrapped
                    line heights can be computed (invisible, off-flow). */}
                <div
                  ref={measureRef}
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-0 invisible"
                />
                {!fullPreview && (
                  <div className="flex min-h-0 min-w-0 flex-1 gap-2">
                    {showLineNumbers && (
                      <div
                        aria-hidden
                        style={{
                          fontSize,
                          lineHeight: `${editorLineHeight}px`,
                          // The numbers are absolutely positioned (they follow
                          // wrapped lines), so they add no intrinsic width —
                          // size the gutter from the widest line number.
                          minWidth: `${Math.max(
                            3,
                            String(Math.max(1, lineCount)).length + 1,
                          )}ch`,
                        }}
                        className=" relative shrink-0 overflow-hidden rounded-md border bg-muted/40 px-1 py-3 text-right font-mono text-muted-foreground select-none"
                      >
                        <div
                          ref={gutterInnerRef}
                          style={{ willChange: 'transform' }}
                          className="relative flex justify-center"
                        >
                          {Array.from({ length: lineCount }, (_, index) => (
                            <div
                              key={index}
                              style={{
                                position: 'absolute',
                                top:
                                  lineTops[index] ?? index * editorLineHeight,
                                // Span the gutter so text-right aligns the
                                // digits and the active highlight covers the
                                // full row.
                                insetInline: 0,
                              }}
                              className={cn(
                                'px-0 text-center text-sky-600 leading-[1.2] ',
                                index === caretLine &&
                                  'rounded-sm bg-primary/10 font-semibold text-foreground',
                              )}
                            >
                              {index + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <textarea
                          ref={textareaRef}
                          value={content}
                          onChange={(event) =>
                            commitContent(event.target.value)
                          }
                          onSelect={(event) => {
                            const textarea = event.currentTarget
                            setSelectionRange({
                              start: textarea.selectionStart,
                              end: textarea.selectionEnd,
                            })
                            syncCaretLine()
                          }}
                          onKeyDown={(event) => {
                            // Tab indents with the configured width; Shift+Tab
                            // outdents the leading whitespace of the current line.
                            if (event.key !== 'Tab') return
                            event.preventDefault()
                            const { selectionStart, selectionEnd } =
                              event.currentTarget
                            if (event.shiftKey) {
                              const lineStart =
                                content.lastIndexOf('\n', selectionStart - 1) +
                                1
                              const lead = content.slice(
                                lineStart,
                                lineStart + tabSize,
                              )
                              const removed =
                                lead.length - lead.trimStart().length
                              if (removed > 0) {
                                applyTransform((text) => ({
                                  text:
                                    text.slice(0, lineStart) +
                                    text.slice(lineStart + removed),
                                  start: Math.max(
                                    lineStart,
                                    selectionStart - removed,
                                  ),
                                  end: Math.max(
                                    lineStart,
                                    selectionEnd - removed,
                                  ),
                                }))
                              }
                            } else {
                              applyTransform((text, start, end) => ({
                                text: `${text.slice(0, start)}${' '.repeat(tabSize)}${text.slice(end)}`,
                                start: start + tabSize,
                                end: start + tabSize,
                              }))
                            }
                          }}
                          spellCheck={false}
                          wrap={wordWrap ? 'soft' : 'off'}
                          style={{
                            fontSize,
                            lineHeight: `${editorLineHeight}px`,
                          }}
                          className={cn(
                            // text-file-editor-textarea re-enables auto height/padding
                            // via a more-specific base-layer rule (the global base
                            // style clamps every textarea to h-6, a single line).
                            'text-file-editor-textarea min-h-0 min-w-0 h-auto! flex-1 resize-none rounded-md border bg-background p-3 py-3! font-mono outline-none focus:ring-1 focus:ring-primary/50',
                            !wordWrap && 'whitespace-pre overflow-x-auto',
                          )}
                          placeholder="Start typing…"
                        />
                      </ContextMenuTrigger>
                      <ContextMenuContent className="min-w-[13rem]">
                        <ContextMenuItem
                          disabled={undoStack.length === 0}
                          onSelect={undo}
                        >
                          <IconArrowBackUp className="h-4 w-4" />
                          Undo
                          <ContextMenuShortcut>Ctrl+Z</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem
                          disabled={redoStack.length === 0}
                          onSelect={redo}
                        >
                          <IconArrowForwardUp className="h-4 w-4" />
                          Redo
                          <ContextMenuShortcut>Ctrl+Y</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          disabled={!hasSelection}
                          onSelect={cutSelection}
                        >
                          <IconCut className="h-4 w-4" />
                          Cut
                          <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem
                          disabled={!hasSelection}
                          onSelect={copySelection}
                        >
                          <IconCopy className="h-4 w-4" />
                          Copy
                          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem onSelect={() => void pasteClipboard()}>
                          <IconClipboard className="h-4 w-4" />
                          Paste
                          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem onSelect={selectAll}>
                          <IconSelectAll className="h-4 w-4" />
                          Select All
                          <ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onSelect={openFind}>
                          <IconSearch className="h-4 w-4" />
                          Find &amp; Replace
                          <ContextMenuShortcut>Ctrl+F</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem onSelect={() => void copyAll()}>
                          <IconCopy className="h-4 w-4" />
                          Copy All
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </div>
                )}
                {isMarkdown && showPreview && (
                  <div
                    className={cn(
                      'prose prose-sm dark:prose-invert min-h-0 overflow-auto rounded-md border bg-muted/30 p-4',
                      fullPreview ? 'flex-1' : 'w-1/2 shrink-0',
                    )}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(content),
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <DialogFooter className="items-center gap-2">
            <span className="mr-auto text-xs text-muted-foreground">
              {wordCount.toLocaleString()} words ·{' '}
              {content.length.toLocaleString()} chars ·{' '}
              {lineCount.toLocaleString()} lines
            </span>
            <Button type="button" variant="outline" onClick={requestClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void save()}
              disabled={saving || loading}
            >
              {saving && <IconLoader2 className="h-4 w-4 animate-spin" />}
              {isCreate ? 'Create file' : 'Save'}
            </Button>
          </DialogFooter>

          {/* Corner resize handle — bottom-right, hidden while maximized. */}
          {!maximized && (
            <div
              role="button"
              aria-label="Resize editor"
              title="Resize"
              onPointerDown={startCornerResize}
              className="absolute right-1 bottom-1 z-10 flex h-4 w-4 cursor-nwse-resize touch-none items-center justify-center rounded-sm text-muted-foreground/50 hover:bg-muted hover:text-foreground"
            >
              <IconArrowsDiagonal className="h-3.5 w-3.5" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Unsaved-changes guard: shown whenever a close is requested while the
        content (or a new file's name) differs from the saved baseline. */}
      <AlertDialog
        open={confirmDiscard}
        onOpenChange={(next) => {
          if (!next) setConfirmDiscard(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              {isCreate
                ? 'Your new file has not been created yet — closing now loses everything you typed.'
                : `“${node?.name}” has changes that are not saved to the server yet.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={() => {
                // Confirmed discard: reset state so the next open starts clean
                // even if the dialog stays mounted.
                setContent(baseline.content)
                setName(baseline.name)
                setUndoStack([])
                setRedoStack([])
                setConfirmDiscard(false)
                onOpenChange(false)
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
