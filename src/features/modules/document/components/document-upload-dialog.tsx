import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { IconUpload, IconTrash, IconCircleCheck, IconAlertCircle } from '@tabler/icons-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadDocumentService } from '@/features/modules/document/data/api'
import { formatBytes } from '@/utils/format-num'

interface QueueItem {
  id: string
  file: File
  status: 'queued' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

type Visibility = 'private' | 'protected' | 'public'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderId: number | null
  /** Files captured from a page-level drag & drop, pre-filled into the queue. */
  initialFiles?: File[]
  onUploaded?: () => void
}

function makeQueue(files: File[]): QueueItem[] {
  return files.map((file, index) => ({
    id: `${Date.now()}-${index}-${file.name}`,
    file,
    status: 'queued',
    progress: 0,
  }))
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  folderId,
  initialFiles,
  onUploaded,
}: Props) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [visibility, setVisibility] = useState<Visibility>('private')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const items = makeQueue(Array.from(incoming))
    setQueue((prev) => [...prev, ...items])
  }, [])

  // Consume files dropped onto the page when the dialog opens.
  useEffect(() => {
    if (open && initialFiles?.length) {
      addFiles(initialFiles)
    }
  }, [open, initialFiles, addFiles])

  const reset = useCallback(() => {
    setQueue([])
    setDragOver(false)
    setVisibility('private')
    setDescription('')
    setUploading(false)
  }, [])

  const handleOpenChange = (next: boolean) => {
    if (uploading && next === false) {
      toast.warning('Please wait for uploads to finish (or remove them).')
      return
    }
    if (!next) reset()
    onOpenChange(next)
  }

  const patchItem = (id: string, patch: Partial<QueueItem>) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }

  const uploadAll = async () => {
    const pending = queue.filter((item) => item.status === 'queued' || item.status === 'error')
    if (pending.length === 0) {
      toast.warning('Add at least one file before uploading.')
      return
    }

    setUploading(true)
    let succeeded = 0
    let failed = 0

    // Sequential keeps per-file progress readable and avoids swamping the
    // PHP worker pool with many parallel multipart bodies.
    for (const item of pending) {
      patchItem(item.id, { status: 'uploading', progress: 0, error: undefined })
      try {
        await uploadDocumentService(item.file, {
          parentId: folderId,
          visibility,
          description: description || null,
          onProgress: (percent) => patchItem(item.id, { progress: percent }),
        })
        patchItem(item.id, { status: 'done', progress: 100 })
        succeeded += 1
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Upload failed'
        patchItem(item.id, { status: 'error', error: message })
        failed += 1
      }
    }

    setUploading(false)

    if (succeeded > 0) {
      toast.success(`Uploaded ${succeeded} file${succeeded === 1 ? '' : 's'}.`)
      onUploaded?.()
    }
    if (failed > 0) {
      toast.error(`${failed} file${failed === 1 ? '' : 's'} failed to upload.`)
      return // keep dialog open so user can retry the failed ones
    }
    reset()
    onOpenChange(false)
  }

  const pendingCount = queue.filter((item) => item.status !== 'done').length
  const doneCount = queue.length - pendingCount

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload documents</DialogTitle>
          <DialogDescription>
            {folderId != null
              ? 'Files will be added to the current folder.'
              : 'Files will be added to your root.'}{' '}
            Drag and drop or browse — multiple files supported.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload files dropzone"
            className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed py-8 text-center transition-colors ${
              dragOver
                ? 'border-primary/60 bg-primary/5'
                : 'border-slate-200 bg-muted/30 hover:border-primary/40 dark:border-white/[0.07]'
            }`}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={(event) => {
              const related = event.relatedTarget as Node | null
              if (!related || !event.currentTarget.contains(related)) {
                setDragOver(false)
              }
            }}
            onDrop={(event) => {
              event.preventDefault()
              setDragOver(false)
              if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files)
            }}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
            }}
          >
            <IconUpload className="h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-medium">Drag &amp; drop files here</p>
            <p className="text-xs text-muted-foreground">
              or click to browse — up to 50 MB per file
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => {
                if (event.target.files?.length) addFiles(event.target.files)
                event.target.value = '' // allow re-picking the same file
              }}
            />
          </div>

          {/* Metadata */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={(value) => setVisibility(value as Visibility)}
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (only me)</SelectItem>
                  <SelectItem value="public">Public (company)</SelectItem>
                  <SelectItem value="protected">Shared (via sharing)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes (optional)</Label>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short description"
                className="h-8"
              />
            </div>
          </div>

          {/* Queue */}
          {queue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {queue.length} file{queue.length === 1 ? '' : 's'} queued
                  {doneCount > 0 ? ` · ${doneCount} uploaded` : ''}
                </span>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="h-6 gap-1 px-2 text-xs"
                    onClick={() => setQueue([])}
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                    Clear all
                  </Button>
                )}
              </div>
              <ul className="max-h-44 space-y-1.5 overflow-y-auto rounded-md border bg-muted/40 p-2">
                {queue.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm">
                    <QueueStatusIcon status={item.status} />
                    <span className="min-w-0 flex-1 truncate" title={item.file.name}>
                      {item.file.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatBytes(item.file.size)}
                    </span>
                    {item.status === 'uploading' && (
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <span
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </span>
                        <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                          {item.progress}%
                        </span>
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="max-w-32 shrink-0 truncate text-xs text-destructive" title={item.error}>
                        {item.error}
                      </span>
                    )}
                    {!uploading && item.status !== 'done' && (
                      <button
                        type="button"
                        aria-label={`Remove ${item.file.name}`}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => removeItem(item.id)}
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={uploading}>
            Close
          </Button>
          <Button onClick={uploadAll} disabled={uploading || pendingCount === 0}>
            {uploading
              ? 'Uploading…'
              : `Upload ${pendingCount > 0 ? `(${pendingCount})` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QueueStatusIcon({ status }: { status: QueueItem['status'] }) {
  if (status === 'done') {
    return <IconCircleCheck className="h-4 w-4 shrink-0 text-emerald-600" />
  }
  if (status === 'error') {
    return <IconAlertCircle className="h-4 w-4 shrink-0 text-destructive" />
  }
  return <IconUpload className="h-4 w-4 shrink-0 text-muted-foreground" />
}
