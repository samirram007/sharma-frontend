import { describe, expect, it } from 'vitest'
import {
  buildFolderTree,
  selfAndDescendantIds,
  type FolderOption,
} from './move-copy-dialog'

const tree: FolderOption[] = [
  { id: 1, name: 'first', parentId: null },
  { id: 2, name: 'first-child', parentId: 1 },
  { id: 3, name: 'deep', parentId: 2 },
  { id: 4, name: 'second', parentId: null },
  { id: 5, name: 'alpha', parentId: 4 },
]

describe('buildFolderTree', () => {
  it('builds a hierarchy from the flat folder list, siblings sorted by name', () => {
    const [first, second] = buildFolderTree(tree)

    expect(first.name).toBe('first')
    expect(first.children.map((child) => child.id)).toEqual([2])
    expect(first.children[0].children.map((child) => child.id)).toEqual([3])

    // Roots sort by name: "first" < "second"; "alpha" sorts under "second".
    expect(second.name).toBe('second')
    expect(second.children[0].name).toBe('alpha')
  })

  it('keeps folders whose parent is missing from the list at the root', () => {
    const orphaned: FolderOption[] = [{ id: 9, name: 'orphan', parentId: 4242 }]
    const roots = buildFolderTree(orphaned)
    expect(roots.map((folder) => folder.id)).toEqual([9])
  })

  it('excludes only the given ids and their descendants', () => {
    const [first] = buildFolderTree(tree, new Set([2, 3]))

    expect(first.children).toEqual([])
    // Other branches are untouched.
    expect(first.name).toBe('first')
  })

  it('excludes an entire root branch when the root id is excluded', () => {
    const roots = buildFolderTree(tree, new Set([4]))
    expect(roots.map((folder) => folder.id)).toEqual([1])
  })
})

describe('selfAndDescendantIds', () => {
  it('collects the folder itself plus every nested descendant', () => {
    expect(selfAndDescendantIds(tree, 1)).toEqual(new Set([1, 2, 3]))
  })

  it('returns just the folder when it has no children', () => {
    expect(selfAndDescendantIds(tree, 3)).toEqual(new Set([3]))
  })

  it('handles cycles in corrupted data without hanging', () => {
    const cyclic: FolderOption[] = [
      { id: 1, name: 'a', parentId: 2 },
      { id: 2, name: 'b', parentId: 1 },
    ]
    expect(selfAndDescendantIds(cyclic, 1)).toEqual(new Set([1, 2]))
  })
})
