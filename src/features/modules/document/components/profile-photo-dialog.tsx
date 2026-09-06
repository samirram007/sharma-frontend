import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  IconChevronRight,
  IconClipboardCopy,
  IconClipboardX,
  IconDotsVertical,
  IconFile,
  IconFolderPlus,
  IconLoader2,
  IconPhoto,
  IconSearch,
  IconUpload,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  documentBrowseQueryOptions,
  documentSearchQueryOptions,
} from '@/features/modules/document/data/queryOptions'
import {
  createFolderService,
  documentUrl,
  downloadNodeService,
  uploadDocumentService,
} from '@/features/modules/document/data/api'
import { useDocumentNodeActions } from './use-document-node-actions'
import { appearance } from './appearance-store'
import type { DocumentNode } from '@/features/modules/document/data/schema'

/**
 * Profile photo picker backed by the documents system: browse folders,
 * search, upload a new image, or drop a file. Selection sets the appearance
 * store to the node's preview URL (the JWT cookie authorizes the <img>).
 * Right-click on a tile mirrors the document-manager context actions.
 */
export function ProfilePhotoDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  currentPhotoUrl,
  /** Override the default profile-photo copy to reuse this picker as a
   * background chooser (title, description, confirm button label). */
  dialogTitle = 'Choose profile photo',
  dialogDescription = 'Pick an image from your documents, upload one, or drop a file here.',
  confirmLabel = 'Use this photo',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (node: DocumentNode) => void
  isPending?: boolean
  /** Absolute URL of the photo currently in use (shown as selected). */
  currentPhotoUrl?: string | null
  dialogTitle?: string
  dialogDescription?: string
  confirmLabel?: string
}) {
  const queryClient = useQueryClient()
  // Full documents action set (rename, delete, share, move/copy, shortcut,
  // clipboard, properties) + its dialogs, mirroring the documents manager.
  const {
    menuActions,
    pasteClipboard,
    canPaste,
    dialogs: actionDialogs,
  } = useDocumentNodeActions({
    onPreview: (node) =>
      window.open(documentUrl(node.id, 'preview', 'fetch'), '_blank'),
  })
  const [folderId, setFolderId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState<DocumentNode | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  /** Inline "new folder" row inside the grid (null = hidden). */
  const [newFolderName, setNewFolderName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const invalidateDocuments = () =>
    queryClient.invalidateQueries({ queryKey: ['document-manager'] })

  const createFolder = useMutation({
    mutationFn: (payload: { name: string; parentId: number | null }) =>
      createFolderService(payload),
    onSuccess: async () => {
      setNewFolderName(null)
      await invalidateDocuments()
      toast.success('Folder created.')
    },
    onError: () => toast.error('Could not create the folder.'),
  })

  // Fresh state each time the dialog opens.
  useEffect(() => {
    if (!open) return
    setFolderId(null)
    setSearch('')
    setSearchTerm('')
    setSelected(null)
    setUploading(false)
    setDragOver(false)
  }, [open])

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(search.trim()), 250)
    return () => clearTimeout(timer)
  }, [search])

  const searchMode = searchTerm.length > 0

  const browseQuery = useQuery(documentBrowseQueryOptions(folderId))
  const searchQuery = useQuery(documentSearchQueryOptions(searchTerm))

  const folderNodes = (browseQuery.data?.data?.folders ?? []) as DocumentNode[]

  const entries = useMemo<DocumentNode[]>(() => {
    if (searchMode) {
      const nodes = (searchQuery.data?.data ?? []) as DocumentNode[]
      return nodes.filter(
        (node) =>
          node.kind === 'file' && (node.mimeType ?? '').startsWith('image/'),
      )
    }
    return ((browseQuery.data?.data?.files ?? []) as DocumentNode[]).filter(
      (node) => (node.mimeType ?? '').startsWith('image/'),
    )
  }, [searchMode, searchQuery.data, browseQuery.data])

  const breadcrumb = (browseQuery.data?.data?.breadcrumb ??
    []) as DocumentNode[]

  /** Upload picked/dropped image, select it on success so “Use this photo” applies it. */
  const uploadImages = async (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith('image/'))
    if (images.length === 0) {
      toast.error('Only image files can be used as a profile photo.')
      return
    }
    setUploading(true)
    let lastUploaded: DocumentNode | null = null
    try {
      for (const image of images.slice(0, 5)) {
        const response = (await uploadDocumentService(image, {
          parentId: folderId,
          visibility: 'private',
        })) as { data?: DocumentNode }
        if (response?.data) lastUploaded = response.data
      }
      await invalidateDocuments()
      if (lastUploaded) {
        setSelected(lastUploaded)
        toast.success(`Uploaded “${lastUploaded.name}”.`)
      }
    } catch {
      toast.error('Upload failed — try again.')
    } finally {
      setUploading(false)
    }
  }

  const confirmSelection = () => {
    if (!selected) return
    onConfirm(selected)
  }

  const previewSrcFor = (node: DocumentNode) =>
    documentUrl(node.id, 'preview', 'fetch')

  /**
   * Full tile menu = picker-specific actions (use as photo/background) + the
   * complete documents action set — the same items the file panel offers.
   * Rendered in both the right-click menu and the ⋮ dropdown of every tile.
   */
  const tileMenuItems = (node: DocumentNode) => {
    const isImage = (node.mimeType ?? '').startsWith('image/')
    return (
      <>
        {isImage && (
          <>
            <ContextMenuItem onSelect={() => onConfirm(node)}>
              <IconPhoto className="h-4 w-4" />
              {confirmLabel === 'Use as background'
                ? 'Set as background'
                : 'Use as profile photo'}
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => {
                appearance.setWallpaper(previewSrcFor(node))
                toast.success('Workspace background updated.')
              }}
            >
              <IconPhoto className="h-4 w-4 rotate-180" />
              Set as workspace background
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        {/* Same items as the documents file panel (preview/download are
            re-labeled clones of the shared menu shape). */}
        <ContextMenuItem
          onSelect={() => window.open(previewSrcFor(node), '_blank')}
        >
          <IconFile className="h-4 w-4" />
          Open preview
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => void downloadNodeService(node.id, node.name)}
        >
          <IconFile className="h-4 w-4" />
          Download
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => menuActions.onClipboard(node, 'copy')}>
          <IconClipboardCopy className="h-4 w-4" />
          Copy
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => menuActions.onClipboard(node, 'cut')}>
          <IconClipboardCopy className="h-4 w-4 rotate-180" />
          Cut
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => menuActions.onMoveCopy(node, 'move')}>
          <IconFile className="h-4 w-4" />
          Move to…
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => menuActions.onMoveCopy(node, 'copy')}>
          <IconFile className="h-4 w-4" />
          Copy to…
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => menuActions.onCreateShortcut?.(node)}>
          <IconFile className="h-4 w-4" />
          Create shortcut
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => menuActions.onShare(node)}>
          <IconFile className="h-4 w-4" />
          Share
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => menuActions.onRename(node)}>
          <IconFile className="h-4 w-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => menuActions.onProperties(node)}>
          <IconFile className="h-4 w-4" />
          Properties
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => menuActions.onDelete(node)}
        >
          <IconFile className="h-4 w-4" />
          Delete
        </ContextMenuItem>
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search all documents…"
              className="pl-8"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => {
              setSearch('')
              setNewFolderName('')
            }}
            title="New folder here"
          >
            <IconFolderPlus className="h-4 w-4" />
            New folder
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconUpload className="h-4 w-4" />
            )}
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? [])
              event.target.value = ''
              void uploadImages(files)
            }}
          />
        </div>

        {/* Breadcrumb (browse mode only) */}
        {!searchMode && (
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs"
          >
            <button
              type="button"
              className={`rounded px-1.5 py-0.5 hover:bg-muted ${
                folderId === null
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setFolderId(null)}
            >
              All documents
            </button>
            {breadcrumb.map((crumb) => (
              <span key={crumb.id} className="flex items-center gap-1">
                <IconChevronRight className="h-3 w-3 text-muted-foreground/60" />
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
          </nav>
        )}

        <ContextMenu>
          <ContextMenuTrigger asChild>
            <ScrollArea
              className={`h-72 rounded-md border ${
                dragOver ? 'border-primary bg-primary/5' : ''
              }`}
              onDragEnter={(event: React.DragEvent) => {
                if (
                  Array.from(event.dataTransfer?.types ?? []).includes('Files')
                ) {
                  event.preventDefault()
                  setDragOver(true)
                }
              }}
              onDragOver={(event: React.DragEvent) => {
                if (
                  Array.from(event.dataTransfer?.types ?? []).includes('Files')
                ) {
                  event.preventDefault()
                  setDragOver(true)
                }
              }}
              onDragLeave={(event: React.DragEvent) => {
                const related = event.relatedTarget as Node | null
                if (
                  !related ||
                  !(event.currentTarget as HTMLElement).contains(related)
                ) {
                  setDragOver(false)
                }
              }}
              onDrop={(event: React.DragEvent) => {
                event.preventDefault()
                event.stopPropagation()
                setDragOver(false)
                if (event.dataTransfer?.files?.length) {
                  void uploadImages(Array.from(event.dataTransfer.files))
                }
              }}
            >
              <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4">
                {/* Inline new-folder row — first tile when creating. */}
                {!searchMode && newFolderName !== null && (
                  <div className="flex flex-col items-center gap-1 rounded-md border border-dashed p-2 text-xs">
                    <IconFolderPlus className="h-6 w-6 text-muted-foreground" />
                    <Input
                      autoFocus
                      value={newFolderName}
                      placeholder="Folder name"
                      className="h-6 text-xs"
                      disabled={createFolder.isPending}
                      onChange={(event) => setNewFolderName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && newFolderName.trim()) {
                          createFolder.mutate({
                            name: newFolderName.trim(),
                            parentId: folderId,
                          })
                        }
                        if (event.key === 'Escape') setNewFolderName(null)
                      }}
                      onBlur={() => {
                        if (newFolderName.trim()) {
                          createFolder.mutate({
                            name: newFolderName.trim(),
                            parentId: folderId,
                          })
                        } else {
                          setNewFolderName(null)
                        }
                      }}
                    />
                  </div>
                )}
                {/* Folder tiles let you descend; hidden while searching */}
                {!searchMode &&
                  folderNodes.map((folder) => (
                    <button
                      key={folder.id}
                      type="button"
                      className="flex flex-col items-center gap-1 rounded-md border p-2 text-xs hover:bg-muted"
                      onClick={() => setFolderId(folder.id)}
                    >
                      <IconFile className="h-6 w-6 text-amber-500" />
                      <span className="line-clamp-2 break-all">
                        {folder.name}
                      </span>
                    </button>
                  ))}
                {entries.map((node) => {
                  const previewSrc = previewSrcFor(node)
                  const isSelected = selected?.id === node.id
                  const isCurrent = currentPhotoUrl === previewSrc
                  return (
                    <ContextMenu key={node.id}>
                      <ContextMenuTrigger asChild>
                        <button
                          type="button"
                          className={`relative flex flex-col items-center gap-1 rounded-md border p-2 text-xs transition ${
                            isSelected
                              ? 'ring-2 ring-primary'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelected(node)}
                          onDoubleClick={() => onConfirm(node)}
                          title="Click to select · double-click to use"
                        >
                          <img
                            src={previewSrc}
                            alt={node.name}
                            className="h-14 w-14 rounded object-cover"
                            loading="lazy"
                            draggable={false}
                          />
                          <span className="line-clamp-2 break-all">
                            {node.name}
                          </span>
                          {isCurrent && (
                            <span className="absolute left-1 top-1 rounded bg-primary px-1 text-[9px] font-medium text-primary-foreground">
                              current
                            </span>
                          )}
                          <span
                            className="absolute right-0.5 top-0.5"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                                >
                                  <IconDotsVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {tileMenuItems(node)}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </span>
                        </button>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        {tileMenuItems(node)}
                      </ContextMenuContent>
                    </ContextMenu>
                  )
                })}
                {entries.length === 0 &&
                  !searchMode &&
                  folderNodes.length === 0 && (
                    <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                      {uploading
                        ? 'Uploading…'
                        : 'No images here yet — upload one or drop a file.'}
                    </p>
                  )}
                {searchMode &&
                  entries.length === 0 &&
                  !searchQuery.isFetching && (
                    <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                      No matching images.
                    </p>
                  )}
              </div>
            </ScrollArea>
          </ContextMenuTrigger>
          {/* Background (empty-space) menu — paste included, as in the file panel */}
          <ContextMenuContent>
            <ContextMenuItem
              onSelect={() => {
                setSearch('')
                setNewFolderName('')
              }}
            >
              <IconFolderPlus className="h-4 w-4" />
              New folder
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => fileInputRef.current?.click()}>
              <IconUpload className="h-4 w-4" />
              Upload image
            </ContextMenuItem>
            <ContextMenuItem
              disabled={!canPaste}
              onSelect={() => pasteClipboard(folderId)}
            >
              <IconClipboardX className="h-4 w-4 rotate-180" />
              Paste
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => void invalidateDocuments()}>
              <IconFile className="h-4 w-4" />
              Refresh
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {/* Full documents action dialogs (rename, delete, share, move/copy,
            conflicts, properties) rendered by the shared hook. */}
        {actionDialogs}

        {selected && (
          <p className="text-xs text-muted-foreground">
            Selected:{' '}
            <span className="font-medium text-foreground">{selected.name}</span>
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!selected || isPending} onClick={confirmSelection}>
            {isPending ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <IconPhoto className="h-4 w-4" />
                {confirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
