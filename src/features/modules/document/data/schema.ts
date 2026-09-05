import { z } from 'zod'

/**
 * A node in the document tree (folder or file) as returned by the
 * DocumentManager module (`/document-manager/*` endpoints).
 */
export const documentNodeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  /** 'folder' | 'file' */
  kind: z.union([z.literal('folder'), z.literal('file')]),
  /** 'private' | 'protected' | 'public' */
  visibility: z.string(),
  parentId: z.number().nullable(),
  ownerId: z.number().nullable(),
  ownerName: z.string().nullish(),
  category: z
    .object({
      id: z.number(),
      name: z.string(),
      color: z.string().nullish(),
    })
    .nullish(),
  type: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullish(),
  description: z.string().nullish(),
  mimeType: z.string().nullish(),
  extension: z.string().nullish(),
  sizeBytes: z.number().nullish(),
  downloadUrl: z.string().nullish(),
  previewUrl: z.string().nullish(),
  sharedWith: z
    .array(
      z.object({
        targetType: z.string(),
        targetId: z.number(),
      }),
    )
    .default([]),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})

export type DocumentNode = z.infer<typeof documentNodeSchema>

export const browseResponseSchema = z.object({
  folderId: z.number().nullable(),
  breadcrumb: z.array(documentNodeSchema),
  folders: z.array(documentNodeSchema),
  files: z.array(documentNodeSchema),
})

export type BrowseResponse = z.infer<typeof browseResponseSchema>

/** Old text-only document shape kept for backwards compatibility. */
export const documentSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().nullish(),
  content: z.string().nullish(),
  link: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
})

export type Document = z.infer<typeof documentSchema>
export const documentListSchema = z.array(documentSchema)

// ─── Form schemas ────────────────────────────────────────────────────────────

export const createFolderFormSchema = z.object({
  name: z.string().min(1, { message: 'Folder name is required.' }).max(255),
})

export type CreateFolderForm = z.infer<typeof createFolderFormSchema>

export const renameNodeFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }).max(255),
})

export type RenameNodeForm = z.infer<typeof renameNodeFormSchema>

export const uploadMetaFormSchema = z.object({
  visibility: z.enum(['private', 'protected', 'public']).default('private'),
  description: z.string().max(1000).nullish(),
  categoryId: z.coerce.number().nullish(),
})

export type UploadMetaForm = z.infer<typeof uploadMetaFormSchema>
