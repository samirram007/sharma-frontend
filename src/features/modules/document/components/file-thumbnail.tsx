import { useEffect, useState } from 'react'
import {
  IconFile,
  IconFolderFilled,
  IconLink,
  IconLock,
  IconUsersGroup,
  IconWorld,
} from '@tabler/icons-react'
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
 * Visibility badge for a node — small shield-style glyph in the corner:
 *  - private   → padlock (only the owner sees it)
 *  - public    → globe (whole company)
 *  - protected → people (shared with explicit users/roles)
 *  - shared    → people + link (protected node reached via a share)
 */
export function VisibilityBadge({
  node,
  large = false,
}: {
  node: DocumentNode
  large?: boolean
}) {
  const size = large ? 'h-3.5 w-3.5' : 'h-3 w-3'
  const sharedVia = node.sharedWith.length > 0

  let icon: React.ReactNode = null
  let title: string
  if (node.visibility === 'public') {
    icon = (
      <IconWorld className={`${size} text-emerald-600 dark:text-emerald-400`} />
    )
    title = 'Public — visible to the whole company'
  } else if (
    node.visibility === 'protected' ||
    (node.visibility === 'private' && sharedVia)
  ) {
    icon = (
      <IconUsersGroup
        className={`${size} text-violet-600 dark:text-violet-400`}
      />
    )
    title =
      node.visibility === 'protected'
        ? 'Protected — shared with specific people'
        : 'Shared with you'
  } else {
    icon = <IconLock className={`${size} text-muted-foreground`} />
    title = 'Private — only you'
  }

  return (
    <span title={title} aria-label={title} className="inline-flex items-center">
      {icon}
    </span>
  )
}

/**
 * Shortcut overlay: chain-link glyph in a corner + the arrow badge that
 * marks every alias (broken shortcuts get the ghost styling from
 * `isBrokenShortcut` in the grid instead).
 */
export function ShortcutGlyph({ large = false }: { large?: boolean }) {
  const size = large ? 'h-3.5 w-3.5' : 'h-3 w-3'
  return (
    <IconLink
      className={`${size} text-teal-600 dark:text-teal-400`}
      aria-label="Shortcut"
    />
  )
}

/** A shortcut whose target row is missing renders as a broken alias. */
export function isBrokenShortcut(node: DocumentNode): boolean {
  return node.kind === 'shortcut' && !node.target
}

/**
 * Thumbnail for a document node: image files render the actual picture via
 * the /preview endpoint (JWT httpOnly cookie auth — the <img> request carries
 * the cookie automatically), everything else falls back to the plain icons.
 *
 * A broken/403 image degrades silently to the icon, so grids never show
 * broken-image glyphs (e.g. when a share revokes access mid-session).
 *
 * Shortcuts show their target's thumbnail (folder/file) with a link badge —
 * a broken shortcut falls back to the muted link glyph.
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

  if (node.kind === 'shortcut') {
    if (node.target) {
      // Show the target's own glyph so the alias is recognizable at a glance.
      const targetNode = {
        ...node,
        id: node.target.id,
        kind: node.target.kind,
        mimeType: node.target.mimeType,
      } as DocumentNode
      return (
        <span className="relative inline-flex shrink-0">
          <FileThumbnail node={targetNode} large={large} />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-background p-px shadow-sm">
            <ShortcutGlyph large={large} />
          </span>
        </span>
      )
    }
    return (
      <IconLink
        className={`${large ? 'h-8 w-8' : 'h-4 w-4'} shrink-0 text-muted-foreground/50`}
        aria-label="Broken shortcut"
      />
    )
  }

  if (node.kind === 'folder') {
    return (
      <IconFolderFilled
        className={`${large ? 'h-8 w-8' : 'h-4 w-4'} shrink-0 ${
          node.color ? '' : 'text-amber-500 dark:text-amber-400'
        }`}
        style={node.color ? { color: node.color } : undefined}
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

/**
 * Large preview tile for Thumbnails view: images fill the tile with the
 * real picture; non-image kinds fall back to the FileThumbnail icon glyph.
 */
export function PreviewImage({ node }: { node: DocumentNode }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [node.id])

  const isImage = node.kind === 'file' && isImageMime(node.mimeType)
  if (isImage && !failed) {
    return (
      <img
        src={documentUrl(node.id, 'preview', 'fetch')}
        alt={node.name}
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    )
  }
  return (
    <span className="flex h-full w-full items-center justify-center bg-muted/40">
      <FileThumbnail node={node} large />
    </span>
  )
}
