import type { DocumentNode } from '@/features/modules/document/data/schema'

/** Checkable inline-preview families, in evaluation order. */
export type PreviewFamily =
  'image' | 'pdf' | 'video' | 'audio' | 'text' | 'unsupported'

const IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
])

const TEXT_EXTENSIONS = new Set(['txt', 'md', 'log', 'json', 'csv'])

const VIDEO_MIMES = new Set(['video/mp4', 'video/webm', 'video/ogg'])

const AUDIO_MIMES = new Set([
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/mp4',
])

/**
 * Classify a node into a preview family. Used by the preview dialog (and its
 * fallback) so the two never disagree about what is renderable.
 */
export function previewFamily(file: DocumentNode): PreviewFamily {
  const mime = file.mimeType ?? ''
  if (IMAGE_MIMES.has(mime)) return 'image'
  if (mime === 'application/pdf') return 'pdf'
  if (VIDEO_MIMES.has(mime)) return 'video'
  if (AUDIO_MIMES.has(mime)) return 'audio'
  if (mime.startsWith('text/') || TEXT_EXTENSIONS.has(file.extension ?? '')) {
    return 'text'
  }
  return 'unsupported'
}

/** Human-readable sentence describing what the node actually is. */
export function describeNode(file: DocumentNode): string {
  if (file.kind === 'folder') return 'Folder'
  switch (previewFamily(file)) {
    case 'image':
      return 'Image file'
    case 'pdf':
      return 'PDF document'
    case 'video':
      return 'Video file'
    case 'audio':
      return 'Audio file'
    case 'text':
      return 'Text file'
    default:
      return file.extension ? `${file.extension.toUpperCase()} file` : 'File'
  }
}

export interface UnsupportedHint {
  title: string
  hint: string
}

/**
 * Guidance for file types the browser cannot render inline: what the file is
 * likely for and how to work with it (open locally / ask the owner / convert).
 */
export function unsupportedHint(file: DocumentNode): UnsupportedHint {
  const extension = (file.extension ?? '').toLowerCase()

  const byExtension: Record<string, UnsupportedHint> = {
    doc: {
      title: 'Word document (legacy)',
      hint: 'Preview is not supported for .doc. Download it and open in Microsoft Word, Google Docs, or LibreOffice.',
    },
    docx: {
      title: 'Word document',
      hint: 'Download it and open in Microsoft Word, Google Docs, or LibreOffice Writer to view and edit.',
    },
    xls: {
      title: 'Excel spreadsheet (legacy)',
      hint: 'Preview is not supported for .xls. Download and open in Microsoft Excel, Google Sheets, or LibreOffice Calc.',
    },
    xlsx: {
      title: 'Excel spreadsheet',
      hint: 'Download and open in Microsoft Excel, Google Sheets, or LibreOffice Calc to view the sheets.',
    },
    ppt: {
      title: 'PowerPoint presentation (legacy)',
      hint: 'Preview is not supported for .ppt. Download and present with Microsoft PowerPoint, Google Slides, or LibreOffice Impress.',
    },
    pptx: {
      title: 'PowerPoint presentation',
      hint: 'Download and present with Microsoft PowerPoint, Google Slides, or LibreOffice Impress.',
    },
    zip: {
      title: 'Compressed archive',
      hint: 'Download the archive and extract it locally — it can hold multiple compressed files.',
    },
    rar: {
      title: 'Compressed archive',
      hint: 'Download the archive and extract it with a tool that supports RAR (7-Zip, WinRAR, or similar).',
    },
    '7z': {
      title: 'Compressed archive',
      hint: 'Download the archive and extract it with 7-Zip or a compatible tool.',
    },
    heic: {
      title: 'iPhone image',
      hint: 'Modern browsers cannot display HEIC. Download it, or convert to JPG/PNG before uploading if you need in-app preview.',
    },
  }

  if (byExtension[extension]) return byExtension[extension]

  const byMime: Array<{
    test: (mime: string) => boolean
    info: UnsupportedHint
  }> = [
    {
      test: (mime) =>
        mime.includes('wordprocessingml') || mime.includes('msword'),
      info: {
        title: 'Word document',
        hint: 'Download it and open in Microsoft Word, Google Docs, or LibreOffice Writer.',
      },
    },
    {
      test: (mime) =>
        mime.includes('spreadsheetml') || mime.includes('ms-excel'),
      info: {
        title: 'Excel spreadsheet',
        hint: 'Download and open in Microsoft Excel, Google Sheets, or LibreOffice Calc.',
      },
    },
    {
      test: (mime) =>
        mime.includes('presentationml') || mime.includes('ms-powerpoint'),
      info: {
        title: 'PowerPoint presentation',
        hint: 'Download and present with Microsoft PowerPoint, Google Slides, or LibreOffice Impress.',
      },
    },
    {
      test: (mime) =>
        mime.startsWith('application/zip') || mime.includes('compressed'),
      info: {
        title: 'Compressed archive',
        hint: 'Download the archive and extract it locally.',
      },
    },
  ]

  const mime = file.mimeType ?? ''
  const matched = byMime.find((entry) => entry.test(mime))
  if (matched) return matched.info

  return {
    title: file.extension
      ? `.${extension.toUpperCase()} file`
      : 'This file type',
    hint: 'This type cannot be previewed in the browser. Download the file to open it with a local application, or ask the owner for a compatible version (PDF previews are supported).',
  }
}
