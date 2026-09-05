import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconChevronRight,
  IconDownload,
  IconLoader2,
  IconSearch,
  IconUpload,
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
import { isImageMime } from './file-thumbnail'
import { useFullscreen } from '@/hooks/use-fullscreen'
import {
  useCreateFolder,
  useDebouncedValue,
  useDeleteNode,
  useDocumentBrowse,
  useDocumentSearch,
  useMoveNode,
  useRenameNode,
} from '@/features/modules/document/data/queryOptions'
import {
  documentUrl,
  downloadNodeService,
  uploadDocumentService,
} from '@/features/modules/document/data/api'
import { formatBytes } from '@/utils/format-num'
import type { DocumentNode } from '@/features/modules/document/data/schema'

export function DocumentsManager() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [folderId, setFolderId] = useState<number | null>(null)
  const [view, setView] = useState<DocumentView>('cards')
  const [uploadOpen, setUploadOpen] = useState(false)
  /** Files captured from a page-level drop, handed to the upload dialog. */
  const [droppedFiles, setDroppedFiles] = useState<File[] | undefined>(undefined)
  const [dragOverPage, setDragOverPage] = useState(false)
  const [dragOverTree, setDragOverTree] = useState(false)
  const [draggingNode, setDraggingNode] = useState<DocumentNode | null>(null)
  const dragDepth = useRef(0)
  const treeContainerRef = useRef<HTMLDivElement | null>(null)

  const tree = useExpandedFolders()

  // Dialog state
  const [createFolderParent, setCreateFolderParent] = useState<number | null | undefined>(undefined)
  const [renameTarget, setRenameTarget] = useState<DocumentNode | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DocumentNode | null>(null)
  const [previewFile, setPreviewFile] = useState<DocumentNode | null>(null)
  const [shareTarget, setShareTarget] = useState<DocumentNode | null>(null)

  const searchMode = debouncedSearch.trim().length > 0

  // ── Data ──
  const browse = useDocumentBrowse(folderId)
  const searchQuery = useDocumentSearch(debouncedSearch)

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

  // ── Mutations ──
  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['document-manager'] }),
    [queryClient],
  )
  const renameNode = useRenameNode()
  const deleteNode = useDeleteNode()
  const moveNode = useMoveNode()

  // ── Drag & drop of existing nodes (move) ──
  const handleDropOnFolder = (targetFolderId: number | null) => {
    const node = draggingNode
    setDraggingNode(null)
    if (!node) return
    if (node.parentId === targetFolderId) {
      toast.info(`"${node.name}" is already in that folder.`)
      return
    }
    moveNode.mutate(
      { id: node.id, parentId: targetFolderId },
      {
        onSuccess: () => toast.success(`Moved "${node.name}".`),
        onError: () => toast.error(`Could not move "${node.name}".`),
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
      toast.loading(`Uploading ${treeDroppedFiles.length} file${treeDroppedFiles.length === 1 ? '' : 's'} to ${folderLabel}…`, {
        id: toastId,
        duration: Infinity,
      })

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
          toast.error(`Uploaded ${done}, failed ${failed}.`, { id: toastId, duration: 5000 })
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
      return target != null && treeContainerRef.current?.contains(target) === true
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

  const openRename = (node: DocumentNode) => {
    setRenameTarget(node)
    setRenameValue(node.name)
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

  const isLoading = searchMode ? searchQuery.isLoading : browse.isLoading
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
      />

      {searchMode && (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <IconSearch className="h-3.5 w-3.5" />
          Results for “{debouncedSearch.trim()}”
        </p>
      )}

      <div className="flex gap-4">
        <div
          ref={treeContainerRef}
          className={searchMode ? 'hidden' : 'hidden w-60 shrink-0 md:block'}
        >
          <FolderTree
            expanded={tree.expanded}
            onToggleExpand={tree.toggle}
            activeFolderId={folderId}
            onSelect={setFolderId}
            onCreateFolder={(parentId) => setCreateFolderParent(parentId)}
            onRenameFolder={openRename}
            onDeleteFolder={setDeleteTarget}
            draggingNodeId={draggingNode?.id ?? null}
            onDropOnFolder={handleDropOnFolder}
            onFileDropOnFolder={handleTreeFileDrop}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {/* Breadcrumb (hidden in search mode) */}
          {!searchMode && (
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
              <button
                type="button"
                className={`rounded px-1.5 py-0.5 hover:bg-muted ${
                  folderId === null ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}
                onClick={() => setFolderId(null)}
              >
                All documents
              </button>
              {breadcrumb.map((crumb) => (
                <span key={crumb.id} className="flex items-center gap-1">
                  <IconChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <button
                    type="button"
                    className={`rounded px-1.5 py-0.5 hover:bg-muted ${
                      crumb.id === folderId ? 'font-medium text-foreground' : 'text-muted-foreground'
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
            </nav>
          )}

          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <IconLoader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <DocumentGrid
              folders={folders}
              files={files}
              view={view}
              searchMode={searchMode}
              onOpenFolder={(folder) => setFolderId(folder.id)}
              onPreviewFile={setPreviewFile}
              onRename={openRename}
              onDelete={setDeleteTarget}
              onShare={setShareTarget}
              onDragStartNode={setDraggingNode}
              onDragEndNode={() => setDraggingNode(null)}
            />
          )}
        </div>
      </div>

      {/* Page-level drop overlay — hidden while hovering the folder tree, which handles drops itself */}
      {dragOverPage && !dragOverTree && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/60 bg-card px-10 py-8 shadow-lg">
            <IconUpload className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium">Drop files to upload</p>
            <p className="text-xs text-muted-foreground">
              They’ll be added to {folderId === null ? 'your root' : 'the current folder'}
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
            <Button disabled={!renameValue.trim() || renameNode.isPending} onClick={submitRename}>
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

      {/* File preview */}
      <FilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />

      {/* Sharing */}
      <DocumentShareDialog node={shareTarget} onClose={() => setShareTarget(null)} />
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
    <Dialog open={parentId !== undefined} onOpenChange={(open) => !open && onClose()}>
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
          <Button disabled={!name.trim() || createFolder.isPending} onClick={submit}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FilePreviewDialog({
  file,
  onClose,
}: {
  file: DocumentNode | null
  onClose: () => void
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const { ref: contentRef, isFullscreen, toggle: toggleFullscreen } =
    useFullscreen<HTMLDivElement>()

  useEffect(() => {
    if (!file) {
      setObjectUrl(null)
      setTextContent(null)
      setFailed(false)
      return
    }
    // PDFs skip the blob fetch — the iframe streams the preview URL directly.
    if (file.mimeType === 'application/pdf') return
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
        if (blob.type.startsWith('text/') || file.extension === 'txt' || file.extension === 'md') {
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

  if (!file) return null

  const isImage = isImageMime(file.mimeType)
  const isPdf = file.mimeType === 'application/pdf'
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
            {file.mimeType ?? 'Unknown type'}
            {file.sizeBytes ? ` · ${formatBytes(file.sizeBytes)}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-auto rounded-md border bg-muted/30"
        >
          {failed ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Preview is not available for this file.
            </div>
          ) : isPdf ? (
            <iframe src={pdfSrc} title={file.name} className="h-full w-full" />
          ) : objectUrl === null ? (
            <div className="flex h-full items-center justify-center">
              <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : isImage ? (
            <img
              src={objectUrl}
              alt={file.name}
              className="mx-auto max-h-full max-w-full object-contain"
            />
          ) : isText ? (
            <pre className="h-full overflow-auto p-4 text-xs whitespace-pre-wrap">
              {textContent}
            </pre>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <p>No inline preview for this type.</p>
            </div>
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
