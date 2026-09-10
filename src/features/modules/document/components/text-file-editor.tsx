import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  IconBlockquote,
  IconBold,
  IconCode,
  IconEye,
  IconEyeOff,
  IconH1,
  IconH2,
  IconH3,
  IconItalic,
  IconLayoutColumns,
  IconLineHeight,
  IconLink,
  IconList,
  IconListNumbers,
  IconLoader2,
  IconMarkdown,
  IconMinus,
  IconStrikethrough,
  IconTextWrap,
} from '@tabler/icons-react'
import {
  createTextFileService,
  readTextFileService,
  updateTextFileService,
} from '../data/api'
import type { DocumentNode } from '../data/schema'

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
  const [showPreview, setShowPreview] = useState(false)
  const [fullPreview, setFullPreview] = useState(false)
  const [wordWrap, setWordWrap] = useState(true)
  const [showLineNumbers, setShowLineNumbers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  /** Saved baseline to diff against for the unsaved-changes guard. */
  const [baseline, setBaseline] = useState<{ name: string; content: string }>({
    name: '',
    content: '',
  })
  /** Pending close awaiting the discard-confirmation answer. */
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const effectiveName = isCreate ? name : (node?.name ?? '')
  const extension = useMemo(() => {
    const match = /\.([a-z0-9]+)$/i.exec(effectiveName)
    return (match?.[1] ?? '').toLowerCase()
  }, [effectiveName])
  const isMarkdown = extension === 'md'

  // Reset/load when the dialog opens.
  useEffect(() => {
    if (!open) return
    if (isCreate) {
      const initialName = newKind === 'md' ? 'Untitled.md' : 'Untitled.txt'
      const initialContent = DEFAULT_CONTENT[newKind ?? 'txt']
      setName(initialName)
      setContent(initialContent)
      setBaseline({ name: initialName, content: initialContent })
      return
    }
    if (!node) return
    setLoading(true)
    readTextFileService(node.id)
      .then((response) => {
        const loaded = (response?.data?.content as string) ?? ''
        setContent(loaded)
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
      setContent(result.text)
      // Restore focus/selection after React commits the new value.
      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(result.start, result.end)
      })
    },
    [content],
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
        <DialogContent className="flex h-[92vh] max-w-5xl flex-col gap-3 sm:h-[88vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconMarkdown className="h-4 w-4" />
              {isCreate
                ? `New ${newKind?.toUpperCase() ?? ''} file`
                : `Edit ${node?.name}`}
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
              {/* Toolbar — formatting (markdown only) + view options for both kinds. */}
              <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/30 p-1">
                {isMarkdown &&
                  markdownGroups.map((group, groupIndex) => (
                    <div
                      key={`group-${groupIndex}`}
                      className="flex items-center gap-1"
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
                          className="h-7 w-7"
                          title={item.title}
                          aria-label={item.title}
                          onClick={item.onClick}
                        >
                          {item.icon}
                        </Button>
                      ))}
                    </div>
                  ))}
                {isMarkdown && (
                  <Separator orientation="vertical" className="mx-1 h-5" />
                )}
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

              {/* Editor + preview surface */}
              <div className="flex min-h-0 flex-1 gap-3">
                {!fullPreview && (
                  <div className="flex min-h-0 flex-1 gap-2">
                    {showLineNumbers && (
                      <div
                        aria-hidden
                        className="overflow-hidden rounded-md border bg-muted/40 px-2 py-3 text-right font-mono text-xs leading-5 text-muted-foreground select-none"
                      >
                        {Array.from({ length: lineCount }, (_, index) => (
                          <div key={index}>{index + 1}</div>
                        ))}
                      </div>
                    )}
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      onKeyDown={(event) => {
                        // Tab indents with two spaces; Shift+Tab outdents.
                        if (event.key !== 'Tab') return
                        event.preventDefault()
                        const { selectionStart, selectionEnd } =
                          event.currentTarget
                        if (event.shiftKey) {
                          const lineStart =
                            content.lastIndexOf('\n', selectionStart - 1) + 1
                          const lead = content.slice(lineStart, lineStart + 2)
                          const removed = lead.length - lead.trimStart().length
                          if (removed > 0) {
                            applyTransform((text) => ({
                              text:
                                text.slice(0, lineStart) +
                                text.slice(lineStart + removed),
                              start: Math.max(
                                lineStart,
                                selectionStart - removed,
                              ),
                              end: Math.max(lineStart, selectionEnd - removed),
                            }))
                          }
                        } else {
                          applyTransform((text, start, end) => ({
                            text: `${text.slice(0, start)}  ${text.slice(end)}`,
                            start: start + 2,
                            end: start + 2,
                          }))
                        }
                      }}
                      spellCheck={false}
                      wrap={wordWrap ? 'soft' : 'off'}
                      className={cn(
                        'min-h-0 flex-1 resize-none rounded-md border bg-background p-3 font-mono text-sm leading-5 outline-none focus:ring-1 focus:ring-primary/50',
                        !wordWrap && 'whitespace-pre overflow-x-auto',
                      )}
                      placeholder="Start typing…"
                    />
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
