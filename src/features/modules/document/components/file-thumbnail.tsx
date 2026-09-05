import { useEffect, useState } from 'react'
import { IconFile, IconFolderFilled } from '@tabler/icons-react'
import { documentUrl } from '@/features/modules/document/data/api'
import type { DocumentNode } from '@/features/modules/document/data/schema'

/**
 * Image MIME types the backend preview endpoint streams inline. Shared with
 * the preview dialog, which renders the same set full-size.
 */
export const IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
]

export function isImageMime(mimeType: string | null | undefined): boolean {
  return mimeType ? IMAGE_MIMES.includes(mimeType) : false
}

/**
 * Thumbnail for a document node: image files render the actual picture via
 * the /preview endpoint (JWT httpOnly cookie auth — the <img> request carries
 * the cookie automatically), everything else falls back to the plain icons.
 *
 * A broken/403 image degrades silently to the icon, so grids never show
 * broken-image glyphs (e.g. when a share revokes access mid-session).
 */
export function FileThumbnail({
  node,
  large = false,
}: {
  node: DocumentNode
  large?: boolean
}) {
  const [failed, setFailed] = useState(false)

  const isImage = node.kind === 'file' && isImageMime(node.mimeType)

  // Reset the fallback when a different node is rendered by the same slot.
  useEffect(() => {
    setFailed(false)
  }, [node.id])

  if (node.kind === 'folder') {
    return (
      <IconFolderFilled
        className={`${large ? 'h-8 w-8' : 'h-4 w-4'} shrink-0 text-amber-500 dark:text-amber-400`}
      />
    )
  }

  if (isImage && !failed) {
    return (
      <img
        src={documentUrl(node.id, 'preview', 'fetch')}
        alt=""
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        className={
          large
            ? 'h-10 w-10 shrink-0 rounded border bg-muted object-cover'
            : 'h-4 w-4 shrink-0 rounded-sm object-cover'
        }
      />
    )
  }

  return (
    <IconFile
      className={`${large ? 'h-8 w-8' : 'h-4 w-4'} shrink-0 text-sky-600 dark:text-sky-400`}
    />
  )
}
