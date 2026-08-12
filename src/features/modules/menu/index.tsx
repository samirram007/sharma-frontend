import { Main } from '@/layouts/components/main'

import { useQuery } from '@tanstack/react-query'
import { Loader, SearchIcon } from 'lucide-react'
import { columns } from './components/columns'
import { Dialogs } from './components/dialogs'
import { GridTable } from './components/grid-table'
import DndTreeView from './components/dnd-tree-view'
import MenuPreview from './components/menu-preview'
import PermissionsSection from './components/permissions-section'
import { PrimaryButtons } from './components/primary-buttons'
import MenuProvider from './contexts/menu-context'
import { useMenu } from './contexts/menu-context'
import {
  MenuListSchema,
  MenuTreeSchema,
  type MenuList,
  type MenuTreeNode,
} from './data/schema'
import {
  MenuTreeQueryOptions,
  useMenuDuplicateMutation,
} from './data/queryOptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  IconColumns3,
  IconLockAccess,
  IconTable,
  IconTree,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconDownload,
  IconUpload,
  IconBookmark,
  IconClock,
  IconTrash,
} from '@tabler/icons-react'
import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { toast } from 'sonner'
import { exportMenuService, importMenuService } from './data/api'
import { useQueryClient } from '@tanstack/react-query'

// ── Search persistence helpers ──────────────────────────────────────────────

const MAX_RECENT = 8

interface SavedFilter {
  name: string
  query: string
}

interface MenuProps {
  data: MenuList
}

type ViewMode = 'split' | 'tree' | 'table' | 'preview' | 'permissions'

// ── Stats helpers ───────────────────────────────────────────────────────────

function countTreeNodes(nodes: MenuTreeNode[]): {
  total: number
  active: number
  visible: number
} {
  let total = 0
  let active = 0
  let visible = 0
  const walk = (items: MenuTreeNode[]) => {
    for (const n of items) {
      total++
      if (n.status === 'active') active++
      if (n.isVisible) visible++
      if (n.children?.length) walk(n.children)
    }
  }
  walk(nodes)
  return { total, active, visible }
}

// ── Tree View Section ──────────────────────────────────────────────────────

function TreeViewSection() {
  const { data: treeData, isLoading, isError } = useQuery(MenuTreeQueryOptions)
  const { setOpen, setCurrentRow } = useMenu()
  const duplicateMutation = useMenuDuplicateMutation()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [expandAll, setExpandAll] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // ── Recent searches ────────────────────────────────────────────
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    'menu-recent-searches',
    [],
  )
  const [savedFilters, setSavedFilters] = useLocalStorage<SavedFilter[]>(
    'menu-saved-filters',
    [],
  )

  const pushRecent = useCallback(
    (query: string) => {
      const trimmed = query.trim()
      if (!trimmed) return
      setRecentSearches((prev) =>
        [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, MAX_RECENT),
      )
    },
    [setRecentSearches],
  )

  const clearRecent = useCallback(() => {
    setRecentSearches([])
  }, [setRecentSearches])

  // ── Saved filters ──────────────────────────────────────────────

  const saveCurrentFilter = useCallback(() => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    const name = prompt('Name this filter:', trimmed)
    if (!name?.trim()) return

    setSavedFilters((prev) => [
      { name: name.trim(), query: trimmed },
      ...prev.filter((f) => f.name !== name.trim()),
    ])
    toast.success(`Filter "${name}" saved`)
  }, [searchQuery, setSavedFilters])

  const applyFilter = useCallback(
    (query: string) => {
      setSearchQuery(query)
      pushRecent(query)
      setSearchFocused(false)
    },
    [pushRecent],
  )

  const deleteFilter = useCallback(
    (name: string) => {
      setSavedFilters((prev) => prev.filter((f) => f.name !== name))
    },
    [setSavedFilters],
  )

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Compute derived values before early returns to keep hooks in consistent order
  const tree = MenuTreeSchema.parse(treeData?.data ?? [])
  const stats = useMemo(() => countTreeNodes(tree), [tree])

  // Filter tree based on search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree
    const q = searchQuery.toLowerCase()

    function filterNodes(nodes: MenuTreeNode[]): MenuTreeNode[] {
      return nodes
        .map((node) => {
          const nameMatch = node.menuName.toLowerCase().includes(q)
          const routeMatch = node.route?.toLowerCase().includes(q)
          const codeMatch = node.feature?.code?.toLowerCase().includes(q)
          const selfMatch = nameMatch || routeMatch || codeMatch

          const filteredChildren = node.children?.length
            ? filterNodes(node.children)
            : []

          if (selfMatch || filteredChildren.length > 0) {
            return {
              ...node,
              children: selfMatch ? (node.children ?? []) : filteredChildren,
            }
          }
          return null
        })
        .filter(Boolean) as MenuTreeNode[]
    }

    return filterNodes(tree)
  }, [tree, searchQuery])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-16 text-xs text-destructive">
        Failed to load menu tree. Please try again.
      </div>
    )
  }

  const hasRecent = recentSearches.length > 0
  const hasSaved = savedFilters.length > 0
  const showDropdown = searchFocused && (hasRecent || hasSaved)

  return (
    <div>
      {/* Toolbar: search + expand/collapse all + stats */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div ref={searchRef} className="relative flex-1 min-w-[160px] max-w-xs">
          <SearchIcon className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchFocused(true)
            }}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                pushRecent(searchQuery.trim())
                setSearchFocused(false)
              }
              if (e.key === 'Escape') setSearchFocused(false)
            }}
            placeholder="Search menu items..."
            className="h-7 rounded border pl-7 pr-7 text-xs shadow-none"
          />
          {/* Save filter button (bookmark) */}
          {searchQuery.trim() && (
            <button
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              onClick={saveCurrentFilter}
              title="Save current search as filter"
            >
              <IconBookmark className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Dropdown: recents + saved filters */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full z-20 mt-0.5 overflow-hidden rounded-md border bg-popover shadow-md animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Recent searches */}
              {hasRecent && (
                <div>
                  <div className="flex items-center justify-between px-2.5 py-1.5">
                    <span className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      <IconClock className="h-3 w-3" />
                      Recent
                    </span>
                    <button
                      className="text-[9px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                      onClick={clearRecent}
                      title="Clear recent searches"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-left hover:bg-muted/60 transition-colors"
                      onClick={() => applyFilter(term)}
                    >
                      <IconClock className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                      <span className="truncate">{term}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Divider */}
              {hasRecent && hasSaved && (
                <div className="border-t border-border/40" />
              )}

              {/* Saved filters */}
              {hasSaved && (
                <div>
                  <div className="flex items-center gap-1 px-2.5 py-1.5">
                    <IconBookmark className="h-3 w-3 text-muted-foreground/40" />
                    <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      Saved Filters
                    </span>
                  </div>
                  {savedFilters.map((f) => (
                    <div
                      key={f.name}
                      className="group flex items-center gap-1 px-2.5 py-1.5 hover:bg-muted/60 transition-colors"
                    >
                      <button
                        className="flex flex-1 items-center gap-2 text-[11px] text-left"
                        onClick={() => applyFilter(f.query)}
                      >
                        <IconBookmark className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                        <span className="truncate font-medium">{f.name}</span>
                        <span className="ml-auto truncate text-[9px] text-muted-foreground/50 hidden sm:inline">
                          {f.query}
                        </span>
                      </button>
                      <button
                        className="shrink-0 p-0.5 text-muted-foreground/30 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => deleteFilter(f.name)}
                        title="Delete filter"
                      >
                        <IconTrash className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-1.5 text-[10px] text-muted-foreground"
            onClick={() => setExpandAll((v) => !v)}
            title={expandAll ? 'Collapse all' : 'Expand all'}
          >
            {expandAll ? (
              <IconChevronUp className="h-3 w-3 mr-1" />
            ) : (
              <IconChevronDown className="h-3 w-3 mr-1" />
            )}
            {expandAll ? 'Collapse' : 'Expand'} All
          </Button>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground ml-auto">
          <span className="font-medium text-foreground/70">{stats.total}</span>{' '}
          items
          <span className="text-muted-foreground/40">·</span>
          <span className="text-green-600/70">{stats.active}</span> active
          <span className="text-muted-foreground/40">·</span>
          <span className="text-blue-600/70">{stats.visible}</span> visible
        </div>
      </div>

      {/* Tree */}
      <div className="py-0.5">
        {filteredTree.length > 0 ? (
          <DndTreeView
            data={filteredTree}
            initialExpanded={expandAll}
            onEdit={(item) => {
              setCurrentRow(item)
              setOpen('edit')
            }}
            onDelete={(item) => {
              setCurrentRow(item)
              setOpen('delete')
            }}
            onAddChild={(item) => {
              setCurrentRow(item)
              setOpen('add')
            }}
            onDuplicate={(id) => duplicateMutation.mutate(id)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <p className="text-xs font-medium">
              No results match &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-[10px]">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Preview Section ─────────────────────────────────────────────────────────

function PreviewSection() {
  const { data: treeData, isLoading } = useQuery(MenuTreeQueryOptions)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const tree = MenuTreeSchema.parse(treeData?.data ?? [])

  return (
    <div className="flex justify-center py-1">
      <MenuPreview tree={tree} />
    </div>
  )
}

// ── View mode icons map ─────────────────────────────────────────────────────

const VIEW_CONFIG: Record<
  ViewMode,
  { icon: React.ElementType; label: string }
> = {
  split: { icon: IconColumns3, label: 'Split' },
  tree: { icon: IconTree, label: 'Tree' },
  table: { icon: IconTable, label: 'Table' },
  preview: { icon: IconEye, label: 'Preview' },
  permissions: { icon: IconLockAccess, label: 'Permissions' },
}

// ── Main Menu Component ─────────────────────────────────────────────────────

export default function Menu({ data }: MenuProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const queryClient = useQueryClient()
  const importInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExport = useCallback(async () => {
    try {
      setExporting(true)
      const res = await exportMenuService()
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `menu-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Menu entries exported successfully')
    } catch (err) {
      toast.error('Export failed')
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }, [])

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        setImporting(true)
        const text = await file.text()
        const items = JSON.parse(text)
        const array = Array.isArray(items) ? items : [items]

        const res = await importMenuService(array)
        queryClient.invalidateQueries({ queryKey: ['Menus'] })
        toast.success(res.message ?? 'Menu entries imported successfully')
      } catch (err) {
        toast.error('Import failed — check that the file is valid JSON')
        console.error('Import error:', err)
      } finally {
        setImporting(false)
        if (importInputRef.current) importInputRef.current.value = ''
      }
    },
    [queryClient],
  )

  return (
    <MenuProvider>
      <Main className="min-w-full">
        {/* Hidden file input for import */}
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFile}
        />

        {/* Ultra-compact header */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {/* View mode switcher */}
          <div className="flex items-center gap-0.5 rounded-lg border bg-card p-0.5 shadow-sm">
            {(Object.keys(VIEW_CONFIG) as ViewMode[]).map((mode) => {
              const cfg = VIEW_CONFIG[mode]
              const Icon = cfg.icon
              return (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setViewMode(mode)}
                >
                  <Icon className="mr-1 h-3.5 w-3.5" />
                  {cfg.label}
                </Button>
              )
            })}
          </div>

          {/* Action buttons — only show for modes that need them */}
          <div className="flex items-center gap-1.5">
            {/* Export / Import */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[10px]"
              onClick={handleExport}
              disabled={exporting}
              title="Export all menu entries as JSON"
            >
              <IconDownload className="mr-1 h-3 w-3" />
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[10px]"
              onClick={() => importInputRef.current?.click()}
              disabled={importing}
              title="Import menu entries from JSON file"
            >
              <IconUpload className="mr-1 h-3 w-3" />
              {importing ? 'Importing...' : 'Import'}
            </Button>
            {viewMode !== 'preview' && viewMode !== 'permissions' && (
              <PrimaryButtons />
            )}
          </div>
        </div>

        {/* Content area */}
        {viewMode === 'split' && (
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Tree Editor */}
            <div className="min-w-0 flex-1 rounded-lg border bg-card shadow-sm">
              <div className="border-b px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Menu Tree
                </span>
              </div>
              <div className="p-2">
                <TreeViewSection />
              </div>
            </div>

            {/* Preview */}
            <div className="w-full shrink-0 lg:w-72 xl:w-80">
              <div className="sticky top-4 rounded-lg border bg-card shadow-sm">
                <div className="border-b px-3 py-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Sidebar Preview
                  </span>
                </div>
                <div className="p-2">
                  <PreviewSection />
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'tree' && (
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b px-3 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Menu Tree
              </span>
            </div>
            <div className="p-2">
              <TreeViewSection />
            </div>
          </div>
        )}

        {viewMode === 'table' && (
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b px-3 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                All Menu Entries
              </span>
              <span className="ml-2 text-[10px] text-muted-foreground/50">
                ({data?.length ?? 0} items)
              </span>
            </div>
            <div className="p-3">
              <GridTable
                data={MenuListSchema.parse(data ?? [])}
                columns={columns}
              />
            </div>
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="mx-auto max-w-sm rounded-lg border bg-card shadow-sm">
            <div className="border-b px-3 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Full Sidebar Preview
              </span>
            </div>
            <PreviewSection />
          </div>
        )}

        {viewMode === 'permissions' && (
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b px-3 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Role Permissions
              </span>
              <span className="ml-2 text-[10px] text-muted-foreground/50">
                Control which roles can see each sidebar item
              </span>
            </div>
            <div className="p-3">
              <PermissionsSection />
            </div>
          </div>
        )}
      </Main>
      <Dialogs />
    </MenuProvider>
  )
}
