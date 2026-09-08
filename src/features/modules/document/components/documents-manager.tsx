import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconChevronLeft,
  IconChevronRight,
  IconClipboardCopy,
  IconDownload,
  IconLoader2,
  IconSearch,
  IconUpload,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DocumentGrid } from './document-grid'
import { DocumentToolbar, type DocumentView } from './document-toolbar'
import { FolderTree, useExpandedFolders } from './folder-tree'
import { DocumentUploadDialog } from './document-upload-dialog'
import { DocumentShareDialog } from './document-share-dialog'
import type { ConflictDecision } from './selection-utils'
import { ConflictDialog, type ConflictBatch } from './conflict-dialog'
import {
  MoveCopyDialog,
  type MoveCopyMode,
  type MoveCopyTarget,
} from './move-copy-dialog'
import {
  BackgroundContextMenu,
  type NodeMenuActions,
} from './node-context-menu'
import {
  documentClipboard,
  useDocumentClipboard,
} from './document-clipboard-store'
import { PropertiesDialog } from './properties-dialog'
import { PreviewFallback } from './preview-fallback'
import { describeNode, previewFamily } from './preview-utils'
import { useFullscreen } from '@/hooks/use-fullscreen'
import {
  useCopyNode,
  useCreateFolder,
  useCreateShortcut,
  useDebouncedValue,
  useDeleteNode,
  useDocumentBrowse,
  useDocumentSearch,
  useMoveNode,
  useRenameNode,
  sharedByMeQueryOptions,
  sharedWithMeQueryOptions,
} from '@/features/modules/document/data/queryOptions'
import { useRealtimeDocumentFolder } from '@/features/modules/document/data/useRealtimeDocumentFolder'
import {
  conflictsService,
  deleteBrokenShortcutService,
  documentUrl,
  downloadNodeService,
  resolveShortcutService,
  uploadDocumentService,
  type NodeConflict,
} from '@/features/modules/document/data/api'
import { formatBytes } from '@/utils/format-num'
import {
  isDocumentsTabOpen,
  readLastDocumentsFolder,
  saveLastDocumentsFolder,
} from '@/layouts/lib/recent-pages'
import type { DocumentNode } from '@/features/modules/document/data/schema'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * Folder-name suggestion for a file→file drop: shared extension groups get
 * "Images"/"PDFs", otherwise the name pair becomes "a & b".
 */
function suggestGroupName(dragged: DocumentNode, target: DocumentNode): string {
  const extA = (dragged.extension ?? '').toLowerCase()
  const extB = (target.extension ?? '').toLowerCase()
  if (extA && extA === extB) {
    const groups: Record<string, string> = {
      jpg: 'Images',
      jpeg: 'Images',
      png: 'Images',
      gif: 'Images',
      webp: 'Images',
      svg: 'Images',
      bmp: 'Images',
      pdf: 'PDFs',
      doc: 'Documents',
      docx: 'Documents',
      txt: 'Documents',
      md: 'Documents',
      xls: 'Spreadsheets',
      xlsx: 'Spreadsheets',
      csv: 'Spreadsheets',
      ppt: 'Presentations',
      pptx: 'Presentations',
      zip: 'Archives',
      rar: 'Archives',
      '7z': 'Archives',
    }
    if (groups[extA]) return groups[extA]
  }
  const stripExt = (name: string) => name.replace(/\.[^.]+$/, '')
  return `${stripExt(dragged.name)} & ${stripExt(target.name)}`
}

export function DocumentsManager() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  // The open folder lives in the URL (?folder=<id>) so browser back/forward
  // and page reloads restore the exact location.
  const routerSearch = useSearch({ strict: false })
  const navigate = useNavigate()
  const rawFolderParam = (routerSearch as Record<string, unknown>).folder
  const parsedFolder =
    typeof rawFolderParam === 'number'
      ? rawFolderParam
      : typeof rawFolderParam === 'string' && rawFolderParam !== ''
        ? Number(rawFolderParam)
        : NaN
  const folderId = Number.isFinite(parsedFolder) ? parsedFolder : null
  const setFolderId = (
    next: number | null,
    options?: { replace?: boolean },
  ) => {
    navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => {
        const nextSearch = { ...prev }
        if (next === null) delete nextSearch.folder
        else nextSearch.folder = String(next)
        return nextSearch
      },
      replace: options?.replace ?? false,
    })
  }

  // Remember the last browsed folder; restore it on the next visit — but only
  // while the Documents tab is still open (closing the tab resets to root).
  useEffect(() => {
    saveLastDocumentsFolder(folderId)
  }, [folderId])
  const didRestoreRef = useRef(false)
  useEffect(() => {
    if (didRestoreRef.current) return
    didRestoreRef.current = true
    if (rawFolderParam !== undefined) return // URL already points somewhere
    if (!isDocumentsTabOpen()) return // tab was closed → start fresh at root
    const last = readLastDocumentsFolder()
    if (last != null) setFolderId(last, { replace: true })
  }, [])
  const [view, setView] = useState<DocumentView>('cards')
  /** Show only documents other people shared with the current user. */
  const [sharedOnly, setSharedOnly] = useState(false)
  /** Show only documents the current user shared outward. */
  const [sharedByMe, setSharedByMe] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  /** Files captured from a page-level drop, handed to the upload dialog. */
  const [droppedFiles, setDroppedFiles] = useState<File[] | undefined>(
    undefined,
  )
  const [dragOverPage, setDragOverPage] = useState(false)
  const [dragOverTree, setDragOverTree] = useState(false)
  const [draggingNode, setDraggingNode] = useState<DocumentNode | null>(null)
  const dragDepth = useRef(0)
  const treeContainerRef = useRef<HTMLDivElement | null>(null)
  // Highlight for app-internal drags hovering the file panel (move target).
  const [dragOverPanel, setDragOverPanel] = useState(false)
  // File panel element — hosts the grid's marquee mousedown so drag-select
  // starts anywhere on the panel background, not just on the entries.
  const filePanelRef = useRef<HTMLDivElement | null>(null)
  const [filePanelEl, setFilePanelEl] = useState<HTMLDivElement | null>(null)

  // Determine which view mode is active for the folder tree — needed before
  // useExpandedFolders so each mode keeps its own expansion set.
  const viewMode: 'browse' | 'shared-with-me' | 'shared-by-me' = sharedOnly
    ? 'shared-with-me'
    : sharedByMe
      ? 'shared-by-me'
      : 'browse'

  const tree = useExpandedFolders(viewMode)

  // Dialog state
  const [createFolderParent, setCreateFolderParent] = useState<
    number | null | undefined
  >(undefined)
  const [renameTarget, setRenameTarget] = useState<DocumentNode | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DocumentNode | null>(null)
  const [previewFile, setPreviewFile] = useState<DocumentNode | null>(null)
  const [shareTarget, setShareTarget] = useState<DocumentNode | null>(null)
  const [moveCopyTarget, setMoveCopyTarget] = useState<MoveCopyTarget | null>(
    null,
  )
  const [propertiesTarget, setPropertiesTarget] = useState<DocumentNode | null>(
    null,
  )
  /** Copy/cut clipboard for paste — a module-level store so it survives
      navigating away and back (component state was wiped on remount). */
  const clipboard = useDocumentClipboard()
  /** File dropped on another file — both are grouped into a new folder. */
  const [groupTarget, setGroupTarget] = useState<{
    dragged: DocumentNode
    target: DocumentNode
  } | null>(null)
  const [groupName, setGroupName] = useState('')
  /** Name collisions found by the move/copy pre-check — awaiting user decisions. */
  const [conflictBatch, setConflictBatch] = useState<ConflictBatch | null>(null)
  /** Batch action to finish once all conflicts are resolved (or skipped). */
  const pendingConflictBatch = useRef<
    ((decisions: ConflictDecision[]) => void) | null
  >(null)
  /** Multi-selection across the grid (mixed folders + files). */
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const searchMode = debouncedSearch.trim().length > 0
  /** Folder a search result pointed at — highlighted until something else opens. */
  const [markedFolderId, setMarkedFolderId] = useState<number | null>(null)

  // A folder change or new search resets any active multi-selection.
  useEffect(() => {
    setSelectedIds(new Set())
  }, [folderId, searchMode])

  // ── Data ──
  const browse = useDocumentBrowse(folderId)
  // Realtime: co-sharers' creations/uploads in the open folder refresh
  // the view without a manual reload (host ↔ client both directions).
  useRealtimeDocumentFolder(folderId)
  const searchQuery = useDocumentSearch(debouncedSearch)
  // Flat list from others — fetched only while the Shared-with-me view is on.
  const sharedQuery = useQuery({
    ...sharedWithMeQueryOptions(),
    enabled: sharedOnly,
  })

  // Flat list of the current user's nodes shared outward — fetched only while
  // the Shared-by-me view is on.
  const sharedByMeQuery = useQuery({
    ...sharedByMeQueryOptions(),
    enabled: sharedByMe,
  })

  /**
   * Expand the whole ancestor chain of a folder so it is visible ("marked")
   * in the tree — used when a search result is clicked.
   */
  const markFolderInTree = useCallback(
    (targetFolderId: number | null) => {
      if (targetFolderId === null) return
      const byId = new Map<number, DocumentNode>(
        ((searchQuery.data?.data ?? []) as DocumentNode[]).map((n) => [
          n.id,
          n,
        ]),
      )
      // Walk parent links from the target upwards; also check the current
      // breadcrumb in case the folder was reached by browsing, not search.
      const chain: number[] = []
      const visited = new Set<number>()
      let walker: DocumentNode | undefined = byId.get(targetFolderId)
      if (!walker) {
        walker = (browse.data?.data?.breadcrumb ?? []).find(
          (crumb: DocumentNode) => crumb.id === targetFolderId,
        )
      }
      while (walker && !visited.has(walker.id)) {
        visited.add(walker.id)
        chain.push(walker.id)
        walker = walker.parentId != null ? byId.get(walker.parentId) : undefined
      }
      tree.expandAll(chain)
    },
    [browse.data, searchQuery.data, tree],
  )

  const sharedFolders = (sharedQuery.data?.data?.folders ??
    []) as DocumentNode[]
  const sharedFiles = (sharedQuery.data?.data?.files ?? []) as DocumentNode[]
  const sharedShortcuts = (sharedQuery.data?.data?.shortcuts ??
    []) as DocumentNode[]

  const sharedByMeFolders = (sharedByMeQuery.data?.data?.folders ??
    []) as DocumentNode[]
  const sharedByMeFiles = (sharedByMeQuery.data?.data?.files ??
    []) as DocumentNode[]
  const sharedByMeShortcuts = (sharedByMeQuery.data?.data?.shortcuts ??
    []) as DocumentNode[]

  // Track which shared folder we are currently browsing (null = not in a shared
  // folder context). When the user opens a shared folder from the file panel,
  // this is set so the breadcrumb and protections can reflect the shared context.
  const [sharedFolderContext, setSharedFolderContext] = useState<{
    folderId: number
    ownerId: number | null
    ownerName: string | null
  } | null>(null)

  const breadcrumb = (browse.data?.data?.breadcrumb ?? []) as DocumentNode[]
  const folders = useMemo<DocumentNode[]>(() => {
    if (searchMode) {
      const nodes = (searchQuery.data?.data ?? []) as DocumentNode[]
      return nodes.filter((node) => node.kind === 'folder')
    }
    return (browse.data?.data?.folders ?? []) as DocumentNode[]
  }, [searchMode, searchQuery.data, browse.data])

  const files = useMemo<DocumentNode[]>(() => {
    if (searchMode) {
      const nodes = (searchQuery.data?.data ?? []) as DocumentNode[]
      return nodes.filter((node) => node.kind === 'file')
    }
    return (browse.data?.data?.files ?? []) as DocumentNode[]
  }, [searchMode, searchQuery.data, browse.data])

  const shortcuts = useMemo<DocumentNode[]>(() => {
    if (searchMode) return [] // search already flattens targets into results
    return (browse.data?.data?.shortcuts ?? []) as DocumentNode[]
  }, [searchMode, browse.data])

  // ── Mutations ──
  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['document-manager'] }),
    [queryClient],
  )
  const renameNode = useRenameNode()
  const deleteNode = useDeleteNode()
  const moveNode = useMoveNode()
  const copyNode = useCopyNode()
  const createFolderNode = useCreateFolder()
  const createShortcutNode = useCreateShortcut()

  // ── Move/copy ──
  const applyNodeAction = (
    node: Pick<DocumentNode, 'id' | 'name'>,
    mode: 'move' | 'copy',
    targetFolderId: number | null,
    conflict?: 'replace' | 'rename',
    onDone?: () => void,
  ) => {
    const onSuccess = (label: string) => {
      toast.success(`${mode === 'copy' ? 'Copied' : 'Moved'} "${label}".`)
      onDone?.()
    }
    const onError = (label: string) => {
      toast.error(`Could not ${mode} "${label}".`)
      onDone?.()
    }
    if (mode === 'copy') {
      copyNode.mutate(
        { id: node.id, parentId: targetFolderId, conflict },
        {
          onSuccess: () => onSuccess(node.name),
          onError: () => onError(node.name),
        },
      )
      return
    }
    moveNode.mutate(
      { id: node.id, parentId: targetFolderId, conflict },
      {
        onSuccess: () => onSuccess(node.name),
        onError: () => onError(node.name),
      },
    )
  }

  /**
   * Pre-check the destination for name collisions and ask the user before
   * mutating anything. Works for single nodes and multi-select batches:
   * conflicts are resolved in one dialog (per-node or apply-to-all), then
   * each decision runs as its own mutation. 'skip' does nothing for a node.
   */
  const runBatchWithConflictCheck = (
    nodes: Array<Pick<DocumentNode, 'id' | 'name'>>,
    mode: 'move' | 'copy',
    targetFolderId: number | null,
    onDone?: () => void,
  ) => {
    const executeBatch = (decisions?: ConflictDecision[]) => {
      const skipped = new Set(
        (decisions ?? [])
          .filter((d) => d.choice === 'skip')
          .map((d) => d.movedId),
      )
      const byChoice = (choice: 'replace' | 'rename') =>
        new Set(
          (decisions ?? [])
            .filter((d) => d.choice === choice)
            .map((d) => d.movedId),
        )
      const replaceIds = byChoice('replace')
      const renameIds = byChoice('rename')
      let executed = 0
      const finish = () => {
        executed += 1
        if (executed >= nodes.length) onDone?.()
      }
      for (const node of nodes) {
        if (skipped.has(node.id)) {
          finish()
          continue
        }
        // With no decisions (no conflicts) everything runs with default
        // behavior; with decisions, per-choice conflict strategies apply.
        const conflict = !decisions
          ? undefined
          : replaceIds.has(node.id)
            ? 'replace'
            : renameIds.has(node.id)
              ? 'rename'
              : undefined
        applyNodeAction(node, mode, targetFolderId, conflict, finish)
      }
    }

    // Root accepts same-name nodes — nothing to ask.
    if (targetFolderId === null) {
      executeBatch()
      return
    }
    void conflictsService(
      nodes.map((node) => node.id),
      targetFolderId,
    )
      .then((response) => {
        const conflicts = (response?.data ?? []) as NodeConflict[]
        if (conflicts.length === 0) {
          executeBatch()
          return
        }
        pendingConflictBatch.current = (batchDecisions) => {
          pendingConflictBatch.current = null
          setConflictBatch(null)
          executeBatch(batchDecisions)
        }
        setConflictBatch({ mode, parentId: targetFolderId, conflicts })
      })
      .catch(() => {
        // Pre-check failed — fall back to the straight mutations; the backend
        // still refuses a silent overwrite with 422.
        executeBatch()
      })
  }

  // ── Drag & drop of existing nodes (move or Ctrl+drag copy) ──
  const handleDropOnFolder = (
    targetFolderId: number | null,
    options?: { copy?: boolean },
  ) => {
    // Which nodes travel: the whole selection when the dragged node is part
    // of it, otherwise just the dragged node (click-drag of one item).
    const dragged = draggingNode
    setDraggingNode(null)
    if (!dragged) return
    const selectedNodes = [...folders, ...files].filter((node: DocumentNode) =>
      selectedIds.has(node.id),
    )
    const batch =
      selectedIds.has(dragged.id) && selectedNodes.length > 1
        ? selectedNodes
        : [dragged]
    if (!options?.copy) {
      const inPlace = batch.filter((node) => node.parentId === targetFolderId)
      if (inPlace.length === batch.length) {
        toast.info(
          batch.length === 1
            ? `"${dragged.name}" is already in that folder.`
            : 'All selected items are already in that folder.',
        )
        return
      }
    }
    runBatchWithConflictCheck(
      batch,
      options?.copy ? 'copy' : 'move',
      targetFolderId,
      () => setSelectedIds(new Set()),
    )
  }

  /** Grid drop targets are always concrete folders (never the root). */
  const handleGridDropOnFolder = (
    targetFolderId: number,
    options?: { copy?: boolean },
  ) => {
    handleDropOnFolder(targetFolderId, options)
  }

  /**
   * Open a shortcut: navigate to the target's folder and mark the target so
   * it is highlighted in the tree + grid. Broken links offer cleanup.
   */
  const handleOpenShortcut = (shortcut: DocumentNode) => {
    void resolveShortcutService(shortcut.id)
      .then((response) => {
        const target = (response?.data ?? null) as DocumentNode | null
        if (!target) {
          toast.error('The shortcut target could not be found.')
          return
        }
        if (target.kind === 'folder') {
          setFolderId(target.parentId ?? null)
          if (target.parentId != null) {
            setMarkedFolderId(target.parentId)
            markFolderInTree(target.parentId)
          }
        }
        setPreviewFile(target)
      })
      .catch((error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response
          ?.status
        if (status === 410) {
          toast.error(
            'This shortcut is broken — its target no longer exists.',
            {
              action: {
                label: 'Remove link',
                onClick: () => {
                  void deleteBrokenShortcutService(shortcut.id).then(() => {
                    toast.success('Broken shortcut removed.')
                    invalidate()
                  })
                },
              },
            },
          )
          return
        }
        toast.error('Could not open the shortcut.')
      })
  }

  // ── File panel as a move/copy drop target (drags started inside the app) ──
  // Dragging a node from the folder tree (or within the grid) and releasing it
  // over the panel background moves it into the currently open folder —
  // Ctrl⌘ while dropping copies instead. OS file drags are untouched: they
  // keep flowing to the window-level upload handlers below.
  const isAppNodeDrag = (event: React.DragEvent) => {
    if (draggingNode == null) return false
    return !Array.from(event.dataTransfer?.types ?? []).includes('Files')
  }
  const resetPanelDrag = () => setDragOverPanel(false)
  const handlePanelDragEnter = (event: React.DragEvent) => {
    if (!isAppNodeDrag(event)) return
    setDragOverPanel(true)
  }
  const handlePanelDragLeave = (event: React.DragEvent) => {
    if (!isAppNodeDrag(event)) return
    // Same guard as the grid/tree rows: moving between children of this panel
    // fires dragleave on the old child — only clear when the pointer truly
    // left the panel (relatedTarget no longer inside it, or gone).
    const related = event.relatedTarget as Node | null
    if (!related || !event.currentTarget.contains(related)) resetPanelDrag()
  }
  const handlePanelDragOver = (event: React.DragEvent) => {
    if (!isAppNodeDrag(event)) return
    event.preventDefault()
    event.dataTransfer.dropEffect =
      event.ctrlKey || event.metaKey ? 'copy' : 'move'
  }
  const handlePanelDrop = (event: React.DragEvent) => {
    if (!isAppNodeDrag(event)) return
    event.preventDefault()
    event.stopPropagation()
    resetPanelDrag()
    // Ctrl⌘ while dropping → copy into the open folder instead of moving.
    handleDropOnFolder(folderId, { copy: event.ctrlKey || event.metaKey })
  }

  /**
   * A file was dropped onto another file — suggest grouping both into a new
   * folder. The name is pre-filled and editable in the confirm dialog.
   */
  const handleGridDropOnFile = (targetFile: DocumentNode) => {
    const dragged = draggingNode
    setDraggingNode(null)
    if (!dragged || dragged.id === targetFile.id) return
    if (dragged.parentId !== targetFile.parentId) {
      toast.info(
        `"${dragged.name}" and "${targetFile.name}" live in different folders.`,
      )
      return
    }
    setGroupName(suggestGroupName(dragged, targetFile))
    setGroupTarget({ dragged, target: targetFile })
  }

  /**
   * Group the dragged + target nodes into a freshly created folder (inside
   * their shared parent), then move both in. Uses the copy-safe move API —
   * a failure on the second move leaves both in the new folder's parent,
   * never a half-created state.
   */
  const confirmGroupIntoFolder = () => {
    const pair = groupTarget
    if (!pair || !groupName.trim()) return
    const parentId = pair.dragged.parentId ?? null
    createFolderNode.mutate(
      { name: groupName.trim(), parentId },
      {
        onSuccess: (response) => {
          const created = (response?.data ?? response) as DocumentNode
          if (!created?.id) {
            toast.error('Could not read the created folder.')
            setGroupTarget(null)
            return
          }
          let remaining = 2
          const finish = () => {
            remaining -= 1
            if (remaining === 0) {
              setGroupTarget(null)
              invalidate()
            }
          }
          moveNode.mutate(
            { id: pair.dragged.id, parentId: created.id },
            { onSuccess: finish, onError: () => finish() },
          )
          moveNode.mutate(
            { id: pair.target.id, parentId: created.id },
            { onSuccess: finish, onError: () => finish() },
          )
        },
        onError: () => toast.error('Could not create the folder.'),
      },
    )
  }

  // ── Direct upload for files dropped on the folder tree ──
  const handleTreeFileDrop = useCallback(
    (treeDroppedFiles: File[], targetFolderId: number | null) => {
      const folderLabel =
        targetFolderId === null ? 'root' : `folder #${targetFolderId}`
      const toastId = `tree-upload-${Date.now()}`

      // Show a live progress toast; update it as each file completes.
      toast.loading(
        `Uploading ${treeDroppedFiles.length} file${treeDroppedFiles.length === 1 ? '' : 's'} to ${folderLabel}…`,
        {
          id: toastId,
          duration: Infinity,
        },
      )

      let done = 0
      let failed = 0
      void (async () => {
        for (const droppedFile of treeDroppedFiles) {
          try {
            await uploadDocumentService(droppedFile, {
              parentId: targetFolderId,
              visibility: 'private',
              onProgress: (percent) => {
                toast.loading(
                  `${droppedFile.name} — ${percent}% (${done + 1}/${treeDroppedFiles.length})`,
                  { id: toastId, duration: Infinity },
                )
              },
            })
            done += 1
          } catch {
            failed += 1
          }
        }
        if (failed > 0) {
          toast.error(`Uploaded ${done}, failed ${failed}.`, {
            id: toastId,
            duration: 5000,
          })
        } else {
          toast.success(
            `Uploaded ${done} file${done === 1 ? '' : 's'} to ${folderLabel}.`,
            { id: toastId, duration: 4000 },
          )
        }
        invalidate()
      })()
    },
    [invalidate],
  )

  // ── Page-level file drop (upload) ──
  useEffect(() => {
    const hasFiles = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files')

    const inTree = (event: DragEvent) => {
      const target = event.target as Node | null
      return (
        target != null && treeContainerRef.current?.contains(target) === true
      )
    }
    const onDragEnter = (event: DragEvent) => {
      if (!hasFiles(event)) return
      event.preventDefault()
      dragDepth.current += 1
      if (inTree(event)) {
        setDragOverTree(true)
      } else {
        setDragOverPage(true)
      }
    }
    const onDragLeave = (event: DragEvent) => {
      if (!hasFiles(event)) return
      dragDepth.current -= 1
      if (dragDepth.current <= 0) {
        dragDepth.current = 0
        setDragOverPage(false)
        setDragOverTree(false)
      }
    }
    const onDragOver = (event: DragEvent) => {
      if (hasFiles(event)) event.preventDefault()
    }
    const onDrop = (event: DragEvent) => {
      if (!hasFiles(event)) return
      event.preventDefault()
      dragDepth.current = 0
      setDragOverPage(false)
      setDragOverTree(false)
      // Drops over the tree are handled by FolderTree's own onDrop handlers —
      // skip the page fallback so files are not uploaded twice.
      if (inTree(event)) return
      if (event.dataTransfer?.files?.length) {
        setDroppedFiles(Array.from(event.dataTransfer.files))
        setUploadOpen(true)
      }
    }

    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [])

  // ── Right-click menu actions (shared by grid + tree) ──
  // Declared after openRename below; openRename is referenced inside a closure
  // so ordering is safe, but the object must exist before first render — see
  // the assignment right after openRename's definition.
  let menuActions: NodeMenuActions

  const pasteClipboard = (destinationId: number | null) => {
    if (clipboard.entries.length === 0) return
    const mode = clipboard.mode
    // A cut is one-shot (the source disappears after pasting), but a copy
    // stays on the clipboard so the same items can be pasted repeatedly,
    // into any number of folders, until something else is copied/cut.
    if (mode === 'cut') {
      documentClipboard.removePasted(
        clipboard.entries.map((entry) => entry.nodeId),
      )
    }
    runBatchWithConflictCheck(
      clipboard.entries.map((entry) => ({
        id: entry.nodeId,
        name: entry.name,
      })),
      mode === 'copy' ? 'copy' : 'move',
      destinationId,
    )
  }

  const confirmMoveCopy = (
    node: DocumentNode,
    mode: MoveCopyMode,
    destinationId: number | null,
  ) => {
    runBatchWithConflictCheck([node], mode, destinationId, () =>
      setMoveCopyTarget(null),
    )
  }

  const openRename = (node: DocumentNode) => {
    setRenameTarget(node)
    setRenameValue(node.name)
  }

  menuActions = {
    onPreview: setPreviewFile,
    onRename: openRename,
    onDelete: setDeleteTarget,
    onShare: setShareTarget,
    onMoveCopy: (node, mode) => setMoveCopyTarget({ node, mode }),
    onProperties: setPropertiesTarget,
    onCreateShortcut: (node) => {
      createShortcutNode.mutate(
        { targetId: node.id, parentId: node.parentId },
        {
          onSuccess: () => toast.success(`Shortcut to "${node.name}" created.`),
          onError: () =>
            toast.error(`Could not create a shortcut to "${node.name}".`),
        },
      )
    },
    onClipboard: (node, mode) => {
      // The whole current selection travels when the right-clicked node is
      // part of it; otherwise just the right-clicked node (Explorer-style).
      const nodes =
        selectedIds.size > 0 && selectedIds.has(node.id)
          ? [...selectedIds]
              .map(
                (id) =>
                  folders.find((f) => f.id === id) ??
                  files.find((f) => f.id === id) ??
                  shortcuts.find((s) => s.id === id),
              )
              .filter((n): n is DocumentNode => n != null)
          : [node]
      documentClipboard.set(
        nodes.map((n) => ({ nodeId: n.id, name: n.name, kind: n.kind })),
        mode,
      )
      toast.success(
        mode === 'cut'
          ? `Cut ${nodes.length > 1 ? `${nodes.length} items` : `"${node.name}"`} — open a folder and paste.`
          : `Copied ${nodes.length > 1 ? `${nodes.length} items` : `"${node.name}"`} — paste anywhere, as often as you like.`,
      )
    },
  }

  const submitRename = () => {
    if (!renameTarget || !renameValue.trim()) return
    renameNode.mutate(
      { id: renameTarget.id, name: renameValue.trim() },
      {
        onSuccess: () => {
          toast.success('Renamed.')
          setRenameTarget(null)
        },
        // Backend refuses duplicate sibling names (422) — surface its message.
        onError: (error) => {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? 'Could not rename.'
          toast.error(message)
        },
      },
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const isFolder = deleteTarget.kind === 'folder'
    deleteNode.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(
          isFolder
            ? `Folder "${deleteTarget.name}" and its contents deleted.`
            : `File "${deleteTarget.name}" deleted.`,
        )
        setDeleteTarget(null)
      },
      onError: () => {
        toast.error(`Could not delete "${deleteTarget.name}".`)
        setDeleteTarget(null)
      },
    })
  }

  const isLoading = sharedOnly
    ? sharedQuery.isLoading
    : sharedByMe
      ? sharedByMeQuery.isLoading
      : searchMode
        ? searchQuery.isLoading
        : browse.isLoading
  const isMoving = moveNode.isPending

  return (
    <div className="space-y-4">
      <DocumentToolbar
        search={search}
        onSearchChange={setSearch}
        view={view}
        onViewChange={setView}
        onUpload={() => {
          setDroppedFiles(undefined)
          setUploadOpen(true)
        }}
        onCreateFolder={() => setCreateFolderParent(folderId)}
        sharedOnly={sharedOnly}
        onSharedOnlyChange={(val) => {
          setSharedOnly(val)
          if (val) setSharedByMe(false)
        }}
        sharedByMe={sharedByMe}
        onSharedByMeChange={(val) => {
          setSharedByMe(val)
          if (val) setSharedOnly(false)
        }}
      />

      {searchMode && (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <IconSearch className="h-3.5 w-3.5" />
          Results for “{debouncedSearch.trim()}”
        </p>
      )}

      <div className="flex gap-4">
        {/* The panel stays visible during search — clicking a result marks its
            folder here instead of hiding the panel. */}
        <div ref={treeContainerRef} className="hidden w-60 shrink-0 md:block">
          <FolderTree
            expanded={tree.expanded}
            onToggleExpand={(id) => {
              tree.toggle(id)
              setMarkedFolderId(null)
            }}
            activeFolderId={folderId}
            markedFolderId={markedFolderId}
            onSelect={(id) => {
              setMarkedFolderId(null)
              if (id === -1) {
                // "Shared with me" — switch to that view; folderId stays null
                // (the grid shows the flat shared-with-me list)
                setSharedOnly(true)
                setSharedByMe(false)
                setFolderId(null)
                setSharedFolderContext(null)
                return
              }
              if (id === -2) {
                // "Shared by me" — switch to that view; folderId stays null
                setSharedByMe(true)
                setSharedOnly(false)
                setFolderId(null)
                setSharedFolderContext(null)
                return
              }
              if (id === 0) {
                // Back from shared mode to browse — clear shared context
                setSharedByMe(false)
                setSharedOnly(false)
                setSharedFolderContext(null)
                setFolderId(null)
                return
              }
              // When browsing inside a shared folder (drilled into it from the
              // shared list), keep the shared view active and tag the context
              // with the folder's owner so the banner reflects who shared it.
              if (sharedOnly || sharedByMe) {
                if (id !== null) {
                  const opened =
                    folders.find((f) => f.id === id) ??
                    files.find((f) => f.id === id)
                  if (opened) {
                    setSharedFolderContext({
                      folderId: opened.id,
                      ownerId: opened.ownerId ?? null,
                      ownerName: opened.ownerName ?? null,
                    })
                  }
                }
              }
              // Real folder id — navigate into it
              setFolderId(id)
            }}
            onCreateFolder={(parentId) => setCreateFolderParent(parentId)}
            onRenameFolder={openRename}
            onDeleteFolder={setDeleteTarget}
            onMoveCopyFolder={(node, mode) => setMoveCopyTarget({ node, mode })}
            menuActions={menuActions}
            draggingNodeId={draggingNode?.id ?? null}
            onDragStartFolder={setDraggingNode}
            onDragEndFolder={() => {
              setDraggingNode(null)
              resetPanelDrag()
            }}
            onDropOnFolder={handleDropOnFolder}
            onFileDropOnFolder={handleTreeFileDrop}
            viewMode={viewMode}
            sharedOnly={sharedOnly}
            sharedByMe={sharedByMe}
            onUpload={() => {
              setDroppedFiles(undefined)
              setUploadOpen(true)
            }}
            onPaste={(parentId) => pasteClipboard(parentId)}
            canPaste={clipboard.entries.length > 0}
            onRefresh={invalidate}
            sharedWithMeCount={
              (sharedQuery.data?.data?.folders?.length ?? 0) +
              (sharedQuery.data?.data?.files?.length ?? 0) +
              (sharedQuery.data?.data?.shortcuts?.length ?? 0)
            }
          />
        </div>

        <BackgroundContextMenu
          onNewFolder={() => setCreateFolderParent(folderId)}
          onUpload={() => {
            setDroppedFiles(undefined)
            setUploadOpen(true)
          }}
          onPaste={() => pasteClipboard(folderId)}
          canPaste={clipboard.entries.length > 0}
          onRefresh={invalidate}
          onProperties={() => {
            if (folderId === null) {
              // Root is a location, not a node — describe it synthetically.
              setPropertiesTarget({
                id: 0,
                name: 'All documents',
                kind: 'folder',
                visibility: 'private',
                parentId: null,
                ownerId: null,
                sharedWith: [],
              })
              return
            }
            const currentFolder = breadcrumb.find(
              (crumb) => crumb.id === folderId,
            )
            if (currentFolder) setPropertiesTarget(currentFolder)
          }}
        >
          {/* min-h keeps the paste/drop target at least one visible viewport
              tall, so right-click and drops work below the last row too.
              Doubles as the drop target for app-internal drags: releasing a
              node dragged from the tree moves it into the open folder. */}
          <div
            ref={(node) => {
              filePanelRef.current = node
              setFilePanelEl(node)
            }}
            className={`min-w-0 flex-1 space-y-3 min-h-[calc(100svh-13rem)] rounded-md transition-colors ${
              dragOverPanel
                ? 'bg-primary/5 outline outline-1 outline-dashed outline-primary/50'
                : ''
            }`}
            onDragEnter={handlePanelDragEnter}
            onDragLeave={handlePanelDragLeave}
            onDragOver={handlePanelDragOver}
            onDrop={handlePanelDrop}
          >
            {/* Breadcrumb (hidden in search mode). In shared modes the first
              crumb is the shared entry point. */}
            {!searchMode && (
              <>
                <nav
                  aria-label="Breadcrumb"
                  className="flex flex-wrap items-center gap-1 text-sm"
                >
                  <button
                    type="button"
                    className={`rounded px-1.5 py-0.5 hover:bg-muted ${
                      folderId === null
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground'
                    }`}
                    onClick={() => {
                      if (sharedOnly || sharedByMe) {
                        // In shared mode, go back to the shared root, not the
                        // private root. Clear the shared folder context.
                        setSharedFolderContext(null)
                        if (sharedOnly) {
                          setSharedOnly(true)
                          setSharedByMe(false)
                          setFolderId(null)
                        }
                        if (sharedByMe) {
                          setSharedByMe(true)
                          setSharedOnly(false)
                          setFolderId(null)
                        }
                        return
                      }
                      setFolderId(null)
                    }}
                  >
                    {sharedOnly
                      ? 'Shared with me'
                      : sharedByMe
                        ? 'Shared by me'
                        : 'All documents'}
                  </button>
                  {/* When in shared mode and a folder is open, use the browse breadcrumb
                  so the path reflects the shared folder hierarchy. */}
                  {(sharedOnly || sharedByMe) && folderId != null
                    ? (browse.data?.data?.breadcrumb ?? []).map(
                        (crumb: DocumentNode) => (
                          <span
                            key={crumb.id}
                            className="flex items-center gap-1"
                          >
                            <IconChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                            <button
                              type="button"
                              className={`rounded px-1.5 py-0.5 hover:bg-muted ${
                                crumb.id === folderId
                                  ? 'font-medium text-foreground'
                                  : 'text-muted-foreground'
                              }`}
                              onClick={() => setFolderId(crumb.id)}
                            >
                              {crumb.name}
                            </button>
                          </span>
                        ),
                      )
                    : breadcrumb.map((crumb) => (
                        <span
                          key={crumb.id}
                          className="flex items-center gap-1"
                        >
                          <IconChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <button
                            type="button"
                            className={`rounded px-1.5 py-0.5 hover:bg-muted ${
                              crumb.id === folderId
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground'
                            }`}
                            onClick={() => setFolderId(crumb.id)}
                          >
                            {crumb.name}
                          </button>
                        </span>
                      ))}
                  {isMoving && (
                    <span className="ml-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <IconLoader2 className="h-3 w-3 animate-spin" /> moving…
                    </span>
                  )}
                  {/* Clipboard status — shows what is waiting for paste. A copy
                  stays until something else is copied/cut; a cut clears after
                  the first paste. */}
                  {clipboard.entries.length > 0 && (
                    <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                      <IconClipboardCopy className="h-3.5 w-3.5" />
                      <span>
                        {clipboard.mode === 'cut' ? 'Cut' : 'Copied'}{' '}
                        {clipboard.entries.length === 1
                          ? `"${clipboard.entries[0].name}"`
                          : `${clipboard.entries.length} items`}
                        {clipboard.mode === 'copy' ? ' — paste anywhere' : ''}
                      </span>
                      <button
                        type="button"
                        aria-label="Clear clipboard"
                        title="Clear clipboard"
                        className="rounded p-0.5 hover:bg-muted hover:text-foreground"
                        onClick={() => documentClipboard.clear()}
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </nav>

                {/* Shared context banner — shows owner info + protection notice. */}
                {sharedOnly && (
                  <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                    <IconUsersGroup className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Documents shared with you
                    </span>
                    {sharedFolderContext && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">
                                {(sharedFolderContext.ownerName ??
                                  '?')[0]?.toUpperCase() ?? '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[140px]">
                              Shared by{' '}
                              {sharedFolderContext.ownerName ?? 'unknown'}
                            </span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            This folder was shared with you by{' '}
                            {sharedFolderContext.ownerName ?? 'an unknown user'}
                            . You can view and open it, but cannot move or copy
                            its contents to your private folders.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
                {sharedByMe && (
                  <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                    <IconUsersGroup className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Documents you shared with others
                    </span>
                  </div>
                )}
              </>
            )}

            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                <IconLoader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <DocumentGrid
                // In shared mode the grid shows either the flat shared list (root
                // level) or the browse result (when a shared folder is opened).
                folders={
                  sharedOnly
                    ? folderId != null
                      ? ((browse.data?.data?.folders ?? []) as DocumentNode[])
                      : sharedFolders
                    : sharedByMe
                      ? folderId != null
                        ? ((browse.data?.data?.folders ?? []) as DocumentNode[])
                        : sharedByMeFolders
                      : folders
                }
                files={
                  sharedOnly
                    ? folderId != null
                      ? ((browse.data?.data?.files ?? []) as DocumentNode[])
                      : sharedFiles
                    : sharedByMe
                      ? folderId != null
                        ? ((browse.data?.data?.files ?? []) as DocumentNode[])
                        : sharedByMeFiles
                      : files
                }
                shortcuts={
                  sharedOnly
                    ? folderId != null
                      ? ((browse.data?.data?.shortcuts ?? []) as DocumentNode[])
                      : sharedShortcuts
                    : sharedByMe
                      ? folderId != null
                        ? ((browse.data?.data?.shortcuts ??
                            []) as DocumentNode[])
                        : sharedByMeShortcuts
                      : shortcuts
                }
                view={view}
                searchMode={searchMode || sharedOnly || sharedByMe}
                onOpenFolder={(folder) => {
                  setFolderId(folder.id)
                  // In shared modes, drilling into a shared folder keeps the
                  // shared view active.
                  if (sharedOnly || sharedByMe) {
                    setSharedFolderContext({
                      folderId: folder.id,
                      ownerId: folder.ownerId ?? null,
                      ownerName: folder.ownerName ?? null,
                    })
                    setMarkedFolderId(folder.id)
                    markFolderInTree(folder.id)
                  }
                }}
                onPreviewFile={(file) => {
                  setPreviewFile(file)
                  if (searchMode && file.parentId != null) {
                    setMarkedFolderId(file.parentId)
                    markFolderInTree(file.parentId)
                  }
                }}
                onRename={openRename}
                onDelete={setDeleteTarget}
                onShare={setShareTarget}
                onMoveCopy={(node, mode) => setMoveCopyTarget({ node, mode })}
                menuActions={menuActions}
                onDragStartNode={setDraggingNode}
                onDragEndNode={() => {
                  setDraggingNode(null)
                  resetPanelDrag()
                }}
                draggingNodeId={draggingNode?.id ?? null}
                onDropOnFolder={handleGridDropOnFolder}
                onDropOnFile={handleGridDropOnFile}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                marqueeSurface={filePanelEl}
                onOpenShortcut={handleOpenShortcut}
              />
            )}
          </div>
        </BackgroundContextMenu>
      </div>

      {/* Page-level drop overlay — hidden while hovering the folder tree, which handles drops itself */}
      {dragOverPage && !dragOverTree && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/60 bg-card px-10 py-8 shadow-lg">
            <IconUpload className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium">Drop files to upload</p>
            <p className="text-xs text-muted-foreground">
              They’ll be added to{' '}
              {folderId === null ? 'your root' : 'the current folder'}
            </p>
          </div>
        </div>
      )}

      {/* Upload dialog (also consumes page drops) */}
      <DocumentUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folderId={folderId}
        initialFiles={droppedFiles}
        onUploaded={invalidate}
      />

      {/* Create folder dialog */}
      <CreateFolderDialog
        parentId={createFolderParent}
        onClose={() => setCreateFolderParent(undefined)}
      />

      {/* Move/copy name collisions — Skip / Replace / Keep both (batch) */}
      <ConflictDialog
        batch={conflictBatch}
        onClose={() => {
          setConflictBatch(null)
          pendingConflictBatch.current = null
        }}
        onResolve={(decisions) => pendingConflictBatch.current?.(decisions)}
        isPending={moveNode.isPending || copyNode.isPending}
      />

      {/* File dropped on file — group both into a new (editable-named) folder */}
      <Dialog
        open={groupTarget !== null}
        onOpenChange={(open) => {
          if (!open) setGroupTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create a folder for these files?</DialogTitle>
            <DialogDescription>
              “{groupTarget?.dragged.name}” and “{groupTarget?.target.name}”
              will be moved into a new folder here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="group-folder-name">Folder name</Label>
            <Input
              id="group-folder-name"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter' && groupName.trim())
                  confirmGroupIntoFolder()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupTarget(null)}>
              No, keep them here
            </Button>
            <Button
              disabled={
                !groupName.trim() ||
                createFolderNode.isPending ||
                moveNode.isPending
              }
              onClick={confirmGroupIntoFolder}
            >
              Create folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>
              {renameTarget?.kind === 'folder'
                ? 'Renaming a folder keeps all of its contents.'
                : 'Choose a new name for this file.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="rename-input">Name</Label>
            <Input
              id="rename-input"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              autoFocus
              onKeyDown={(event) => event.key === 'Enter' && submitRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!renameValue.trim() || renameNode.isPending}
              onClick={submitRename}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete {deleteTarget?.kind === 'folder' ? 'folder' : 'file'}?
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.kind === 'folder'
                ? `“${deleteTarget?.name}” and everything inside it will be permanently removed.`
                : `“${deleteTarget?.name}” will be permanently removed.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File preview — navigation follows the visible file list */}
      <FilePreviewDialog
        file={previewFile}
        files={[...folders, ...files]}
        onClose={() => setPreviewFile(null)}
        onNavigate={setPreviewFile}
      />

      {/* Sharing */}
      <DocumentShareDialog
        node={shareTarget}
        onClose={() => setShareTarget(null)}
      />

      {/* Move / copy destination picker */}
      <MoveCopyDialog
        target={moveCopyTarget}
        onClose={() => setMoveCopyTarget(null)}
        onConfirm={confirmMoveCopy}
        isPending={moveNode.isPending || copyNode.isPending}
      />

      {/* Right-click properties */}
      <PropertiesDialog
        node={propertiesTarget}
        onClose={() => setPropertiesTarget(null)}
      />
    </div>
  )
}

interface CreateFolderDialogProps {
  parentId: number | null | undefined
  onClose: () => void
}

function CreateFolderDialog({ parentId, onClose }: CreateFolderDialogProps) {
  const [name, setName] = useState('')
  const createFolder = useCreateFolder()

  // Reset the name each time the dialog opens.
  useEffect(() => {
    if (parentId !== undefined) setName('')
  }, [parentId])

  const submit = () => {
    if (!name.trim()) return
    createFolder.mutate(
      { name: name.trim(), parentId: parentId ?? null },
      {
        onSuccess: () => {
          toast.success(`Folder "${name.trim()}" created.`)
          onClose()
        },
      },
    )
  }

  return (
    <Dialog
      open={parentId !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
          <DialogDescription>
            {parentId == null
              ? 'This folder will be created at the top level.'
              : 'This folder will be created inside the selected folder.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="folder-name-input">Folder name</Label>
          <Input
            id="folder-name-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            onKeyDown={(event) => event.key === 'Enter' && submit()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || createFolder.isPending}
            onClick={submit}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FilePreviewDialog({
  file,
  files,
  onClose,
  onNavigate,
}: {
  file: DocumentNode | null
  /** The list navigation moves through (current folder or search results). */
  files: DocumentNode[]
  onClose: () => void
  onNavigate: (file: DocumentNode) => void
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const {
    ref: contentRef,
    isFullscreen,
    toggle: toggleFullscreen,
  } = useFullscreen<HTMLDivElement>()

  useEffect(() => {
    // Reset per-file state on every open/navigation so the previous file's
    // blob, text or error never bleeds into the new one while loading.
    setObjectUrl(null)
    setTextContent(null)
    setFailed(false)
    if (!file) return
    const family = previewFamily(file)
    // PDFs stream straight from the preview URL in an iframe and unsupported
    // types render the informational fallback — neither needs a blob fetch.
    if (family === 'pdf' || family === 'unsupported') return
    let revoke: string | null = null
    let cancelled = false
    const load = async () => {
      try {
        // Fetch through axios-free fetch with credentials so the JWT cookie
        // applies; the preview endpoint streams inline.
        const response = await fetch(documentUrl(file.id, 'preview', 'fetch'), {
          credentials: 'include',
        })
        if (!response.ok) throw new Error('preview failed')
        const blob = await response.blob()
        if (cancelled) return
        revoke = URL.createObjectURL(blob)
        setObjectUrl(revoke)
        if (family === 'text') {
          setTextContent(await blob.text())
        }
      } catch {
        if (!cancelled) setFailed(true)
      }
    }
    void load()
    return () => {
      cancelled = true
      if (revoke) URL.revokeObjectURL(revoke)
    }
  }, [file])

  // While fullscreen, Escape must exit fullscreen only — the browser consumes
  // the keypress before Radix sees it, so without this capture-phase guard
  // Radix would close the dialog too.
  useEffect(() => {
    if (!isFullscreen) return
    const guard = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()
    }
    // Radix attaches its Escape handler on document — capture beats it.
    document.addEventListener('keydown', guard, true)
    return () => document.removeEventListener('keydown', guard, true)
  }, [isFullscreen])

  // ── Next / previous navigation within the current file list ──
  const index = file ? files.findIndex((entry) => entry.id === file.id) : -1
  const hasPrev = index > 0
  const hasNext = index >= 0 && index < files.length - 1

  useEffect(() => {
    if (!file) return
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
        return
      if (event.key === 'ArrowLeft' && hasPrev) {
        event.preventDefault()
        onNavigate(files[index - 1])
      } else if (event.key === 'ArrowRight' && hasNext) {
        event.preventDefault()
        onNavigate(files[index + 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [file, files, index, hasPrev, hasNext, onNavigate])

  if (!file) return null

  const family = previewFamily(file)
  const isText = textContent !== null

  // PDFs render in an iframe pointed directly at the preview endpoint — the
  // browser streams the bytes progressively instead of waiting for the whole
  // blob the dialog fetches for images/text. The cookie carries auth.
  // #toolbar=0 hides Chrome's PDF toolbar for a cleaner viewer.
  const pdfSrc = `${documentUrl(file.id, 'preview', 'fetch')}#toolbar=0`

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (open) return
        // While fullscreen, Escape is consumed by the guard above; ignore any
        // other stray outside-close so the viewer is never dismissed
        // underneath fullscreen mode.
        if (isFullscreen) return
        onClose()
      }}
    >
      <DialogContent className="flex h-[90vh] w-[95vw] max-w-[95vw] flex-col sm:w-[95vw] sm:max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{file.name}</DialogTitle>
          <DialogDescription className="truncate">
            {describeNode(file)}
            {file.sizeBytes ? ` · ${formatBytes(file.sizeBytes)}` : ''}
          </DialogDescription>
        </DialogHeader>
        {files.length > 1 && (
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              onClick={() => onNavigate(files[index - 1])}
            >
              <IconChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span>
              {index + 1} of {files.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => onNavigate(files[index + 1])}
            >
              Next
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-auto rounded-md border bg-muted/30"
        >
          {failed ? (
            <PreviewFallback file={file} />
          ) : family === 'pdf' ? (
            <iframe src={pdfSrc} title={file.name} className="h-full w-full" />
          ) : family === 'unsupported' ? (
            <PreviewFallback file={file} />
          ) : objectUrl === null ? (
            <div className="flex h-full items-center justify-center">
              <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : family === 'image' ? (
            <img
              src={objectUrl}
              alt={file.name}
              className="mx-auto max-h-full max-w-full object-contain"
            />
          ) : family === 'video' ? (
            // key forces a fresh media element when navigating between files
            <video
              key={file.id}
              src={objectUrl}
              controls
              autoPlay
              className="h-full w-full bg-black object-contain"
            />
          ) : family === 'audio' ? (
            <div className="flex h-full items-center justify-center p-6">
              <audio
                key={file.id}
                src={objectUrl}
                controls
                autoPlay
                className="w-full max-w-md"
              />
            </div>
          ) : isText ? (
            <pre className="h-full overflow-auto p-4 text-xs whitespace-pre-wrap">
              {textContent}
            </pre>
          ) : (
            <PreviewFallback file={file} />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <IconArrowsMinimize className="h-4 w-4" />
            ) : (
              <IconArrowsMaximize className="h-4 w-4" />
            )}
            {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </Button>
          <Button
            variant="outline"
            onClick={() => void downloadNodeService(file.id, file.name)}
          >
            <IconDownload className="h-4 w-4" />
            Download
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
