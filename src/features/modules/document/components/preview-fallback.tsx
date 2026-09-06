import { IconDownload, IconFileInfo, IconHelpCircle } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { downloadNodeService } from '../data/api'
import { formatBytes } from '@/utils/format-num'
import { formatDistanceToNow } from '@/utils/date'
import { describeNode, unsupportedHint } from './preview-utils'
import type { DocumentNode } from '../data/schema'

/**
 * Rich fallback for files the browser cannot render inline: what the file is,
 * who owns it, its size/age, concrete guidance on how to work with it, and a
 * one-click download.
 */
export function PreviewFallback({ file }: { file: DocumentNode }) {
  const info = unsupportedHint(file)

  const details: Array<[string, string]> = [
    ['Type', describeNode(file)],
    ['Size', file.sizeBytes ? formatBytes(file.sizeBytes) : 'Unknown'],
    ['Owner', file.ownerName ?? '—'],
    ['Extension', file.extension ? `.${file.extension.toUpperCase()}` : '—'],
    ['Modified', file.updatedAt ? formatDistanceToNow(file.updatedAt) : '—'],
    [
      'Shared with',
      `${file.sharedWith.length} target${file.sharedWith.length === 1 ? '' : 's'}`,
    ],
  ]

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 overflow-y-auto p-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <IconFileInfo className="h-8 w-8 text-muted-foreground/60" />
        <p className="text-sm font-medium">{info.title}</p>
        <p className="max-w-md text-xs text-muted-foreground">
          “{file.name}” can’t be shown inline — but the file itself is fine.
        </p>
      </div>

      <div className="grid w-full max-w-sm grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-md border bg-card p-4 text-xs">
        {details.map(([label, value]) => (
          <div key={label} className="contents">
            <span className="py-0.5 text-muted-foreground">{label}</span>
            <span className="py-0.5 font-medium">{value}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm space-y-2 rounded-md border border-primary/25 bg-primary/5 p-4">
        <p className="flex items-center gap-1.5 text-xs font-medium">
          <IconHelpCircle className="h-3.5 w-3.5 text-primary" />
          How to use this file
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {info.hint}
        </p>
        <Button
          size="sm"
          className="mt-1"
          onClick={() => void downloadNodeService(file.id, file.name)}
        >
          <IconDownload className="h-4 w-4" />
          Download{' '}
          {file.extension ? `.${file.extension.toUpperCase()}` : 'file'}
        </Button>
      </div>
    </div>
  )
}
