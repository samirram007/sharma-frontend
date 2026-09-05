import { useMemo } from 'react'
import {
  IconFile,
  IconDotsVertical,
  IconDownload,
  IconPencil,
  IconTrash,
  IconEye,
  IconUsersGroup,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatBytes } from '@/utils/format-num'
import { formatDistanceToNow } from '@/utils/date'
import { downloadNodeService } from '@/features/modules/document/data/api'
import { FileThumbnail } from '@/features/modules/document/components/file-thumbnail'
import type { DocumentNode } from '@/features/modules/document/data/schema'

interface DocumentGridProps {
  /** In search mode this is a flat list of mixed folders/files. */
  folders: DocumentNode[]
  files: DocumentNode[]
  view: 'cards' | 'table'
  /** Present when rendering search results (breadcrumb is not applicable). */
  searchMode?: boolean
  onOpenFolder: (folder: DocumentNode) => void
  onPreviewFile: (file: DocumentNode) => void
  onRename: (node: DocumentNode) => void
  onDelete: (node: DocumentNode) => void
  onShare: (node: DocumentNode) => void
  onDragStartNode: (node: DocumentNode) => void
  onDragEndNode: () => void
}

export function DocumentGrid({
  folders,
  files,
  view,
  searchMode = false,
  onOpenFolder,
  onPreviewFile,
  onRename,
  onDelete,
  onShare,
  onDragStartNode,
  onDragEndNode,
}: DocumentGridProps) {
  const entries = useMemo(
    () => [...folders, ...files],
    [folders, files],
  )

  const totalCount = entries.length

  if (totalCount === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        <IconFile className="mb-2 h-8 w-8 text-muted-foreground/40" />
        <p>No documents here yet.</p>
        <p className="text-xs">Use the Upload button — or drag files straight onto this page.</p>
      </div>
    )
  }

  if (view === 'table') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {totalCount} item{totalCount === 1 ? '' : 's'}
        </p>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {!searchMode && <TableHead className="w-28">Kind</TableHead>}
                <TableHead className="w-24">Size</TableHead>
                <TableHead className="w-32">Modified</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((node) => (
                <TableRow
                  key={node.id}
                  draggable
                  onDragStart={() => onDragStartNode(node)}
                  onDragEnd={onDragEndNode}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TableCell>
                    <button
                      type="button"
                      className="flex min-w-0 items-center gap-2 text-left"
                      onClick={() =>
                        node.kind === 'folder' ? onOpenFolder(node) : onPreviewFile(node)
                      }
                    >
                      <FileThumbnail node={node} />
                      <span className="truncate font-medium">{node.name}</span>
                    </button>
                  </TableCell>
                  {!searchMode && (
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {node.kind === 'folder' ? 'Folder' : (node.extension ?? 'File')}
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="text-xs text-muted-foreground">
                    {node.kind === 'folder' ? '—' : formatBytes(node.sizeBytes)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {node.updatedAt ? formatDistanceToNow(node.updatedAt) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <NodeActionsMenu
                      node={node}
                      onPreviewFile={onPreviewFile}
                      onRename={onRename}
                      onDelete={onDelete}
                      onShare={onShare}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // Card view
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {totalCount} item{totalCount === 1 ? '' : 's'}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {entries.map((node) => (
          <div
            key={node.id}
            draggable
            onDragStart={() => onDragStartNode(node)}
            onDragEnd={onDragEndNode}
            className="group relative cursor-grab rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm active:cursor-grabbing"
          >
            <button
              type="button"
              className="flex w-full flex-col items-start gap-2 text-left"
              onClick={() =>
                node.kind === 'folder' ? onOpenFolder(node) : onPreviewFile(node)
              }
            >
              <FileThumbnail node={node} large />
              <span className="line-clamp-2 w-full break-all text-sm font-medium leading-snug">
                {node.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {node.kind === 'folder'
                  ? 'Folder'
                  : `${node.extension?.toUpperCase() ?? 'File'} · ${formatBytes(node.sizeBytes)}`}
              </span>
            </button>
            <div className="absolute right-1.5 top-1.5">
              <NodeActionsMenu
                node={node}
                onPreviewFile={onPreviewFile}
                onRename={onRename}
                onDelete={onDelete}
                onShare={onShare}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface NodeActionsMenuProps {
  node: DocumentNode
  onPreviewFile: (file: DocumentNode) => void
  onRename: (node: DocumentNode) => void
  onDelete: (node: DocumentNode) => void
  onShare: (node: DocumentNode) => void
}

function NodeActionsMenu({ node, onPreviewFile, onRename, onDelete, onShare }: NodeActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        >
          <IconDotsVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {node.kind === 'file' && (
          <>
            <DropdownMenuItem onSelect={() => onPreviewFile(node)}>
              <IconEye className="h-4 w-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => void downloadNodeService(node.id, node.name)}
            >
              <IconDownload className="h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={() => onShare(node)}>
          <IconUsersGroup className="h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onRename(node)}>
          <IconPencil className="h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => onDelete(node)}
        >
          <IconTrash className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
