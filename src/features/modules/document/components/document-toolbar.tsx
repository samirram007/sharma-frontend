import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconSearch,
  IconX,
  IconPlus,
  IconFolderPlus,
  IconLayout2,
  IconList,
  IconSortAscending,
  IconSortDescending,
  IconFilter,
  IconCheck,
  IconUsersGroup,
  IconLayoutSidebar,
  IconBoxMultiple,
  IconCheckbox,
  IconChevronDown,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

export type DocumentView = 'cards' | 'thumbnails' | 'list' | 'table'
export type DocumentSortKey = 'name' | 'size' | 'modified'
export type DocumentSortDir = 'asc' | 'desc'

export interface DocumentSort {
  key: DocumentSortKey
  dir: DocumentSortDir
}

/** Sort options shared by the toolbar dropdown and the background context menu. */
export const DOCUMENT_SORT_OPTIONS: {
  key: DocumentSortKey
  label: string
}[] = [
  { key: 'name', label: 'Name' },
  { key: 'size', label: 'Size' },
  { key: 'modified', label: 'Modified' },
]

/** Layout options for the View dropdown. */
export const DOCUMENT_VIEW_OPTIONS: {
  key: DocumentView
  label: string
}[] = [
  { key: 'cards', label: 'Cards' },
  { key: 'thumbnails', label: 'Thumbnails' },
  { key: 'list', label: 'List' },
  { key: 'table', label: 'Table' },
]

/** Persisted across reloads. */
const VIEW_STORAGE_KEY = 'documents-view'
const SORT_STORAGE_KEY = 'documents-sort'
const PREFS_STORAGE_KEY = 'documents-prefs'

/** Explorer-style "Show" toggles (all persisted with the view/sort prefs). */
export interface DocumentPrefs {
  /** Folder tree panel on the left (Windows: Navigation pane). */
  navigationPane: boolean
  /** Denser rows/cards (Windows: Compact view). */
  compact: boolean
  /** Always-visible selection checkboxes on entries (Windows: Item check boxes). */
  checkBoxes: boolean
  /** Right-hand preview/details panel for the selected node. */
  previewPane: boolean
}

const DEFAULT_PREFS: DocumentPrefs = {
  navigationPane: true,
  compact: false,
  checkBoxes: false,
  previewPane: false,
}

/** Restore the last used view mode (falls back to cards). */
export function readStoredDocumentsView(): DocumentView {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY)
    return raw === 'thumbnails' || raw === 'list' || raw === 'table'
      ? raw
      : 'cards'
  } catch {
    return 'cards'
  }
}

/** Restore the last used sort (falls back to name asc). */
export function readStoredDocumentsSort(): DocumentSort {
  try {
    const key = localStorage.getItem(SORT_STORAGE_KEY)
    const dir = localStorage.getItem(SORT_STORAGE_KEY + '-dir')
    return {
      key: key === 'size' || key === 'modified' ? key : 'name',
      dir: dir === 'desc' ? 'desc' : 'asc',
    }
  } catch {
    return { key: 'name', dir: 'asc' }
  }
}

/** Restore the Explorer-style Show toggles (falls back to defaults). */
export function readStoredDocumentsPrefs(): DocumentPrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY)
    if (!raw) return DEFAULT_PREFS
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFS
  }
}

/** Persist the view mode + sort + Show toggles across reloads. */
export function saveDocumentsState(
  view: DocumentView,
  sort: DocumentSort,
  prefs: DocumentPrefs,
) {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, view)
    localStorage.setItem(SORT_STORAGE_KEY, sort.key)
    localStorage.setItem(SORT_STORAGE_KEY + '-dir', sort.dir)
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Private mode / storage full — state just won't persist.
  }
}

interface Props {
  search: string
  onSearchChange: (search: string) => void
  view: DocumentView
  onViewChange: (view: DocumentView) => void
  /** Current sort (persisted). */
  sort: DocumentSort
  onSortChange: (sort: DocumentSort) => void
  /** Explorer-style Show toggles (persisted). */
  prefs: DocumentPrefs
  onPrefsChange: (prefs: DocumentPrefs) => void
  /** Documents other people shared with the current user. */
  sharedOnly: boolean
  onSharedOnlyChange: (sharedOnly: boolean) => void
  /** Documents the current user shared outward. */
  sharedByMe: boolean
  onSharedByMeChange: (sharedByMe: boolean) => void
  onUpload: () => void
  onCreateFolder: () => void
}

export function DocumentToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
  sort,
  onSortChange,
  prefs,
  onPrefsChange,
  sharedOnly,
  onSharedOnlyChange,
  sharedByMe,
  onSharedByMeChange,
  onUpload,
  onCreateFolder,
}: Props) {
  const activeFilter = sharedOnly || sharedByMe
  const togglePref = (key: keyof DocumentPrefs) =>
    onPrefsChange({ ...prefs, [key]: !prefs[key] })

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative flex-1 sm:max-w-xs">
        <IconSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search all documents…"
          className="h-8 pl-8"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => onSearchChange('')}
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Sort dropdown — key + direction, persisted. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 gap-1.5"
              title="Sort documents"
            >
              {sort.dir === 'desc' ? (
                <IconSortDescending className="h-4 w-4" />
              ) : (
                <IconSortAscending className="h-4 w-4" />
              )}
              {DOCUMENT_SORT_OPTIONS.find((o) => o.key === sort.key)?.label ??
                'Sort'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            {DOCUMENT_SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onSelect={() =>
                  // Clicking the active key flips direction, like Explorer.
                  onSortChange(
                    option.key === sort.key
                      ? {
                          key: option.key,
                          dir: sort.dir === 'asc' ? 'desc' : 'asc',
                        }
                      : { key: option.key, dir: 'asc' },
                  )
                }
              >
                <IconCheck
                  className={cn(
                    'h-4 w-4',
                    sort.key === option.key ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                onSortChange({
                  key: sort.key,
                  dir: sort.dir === 'asc' ? 'desc' : 'asc',
                })
              }
            >
              {sort.dir === 'asc' ? (
                <IconSortDescending className="h-4 w-4" />
              ) : (
                <IconSortAscending className="h-4 w-4" />
              )}
              {sort.dir === 'asc' ? 'Descending' : 'Ascending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter dropdown — the shared views as checkboxes. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-8 gap-1.5',
                activeFilter && 'ring-1 ring-primary/40',
              )}
              title="Filter documents"
            >
              <IconFilter className="h-4 w-4" />
              Filter
              {activeFilter && (
                <IconCheck className="h-3.5 w-3.5 text-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Filter</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => {
                onSharedOnlyChange(!sharedOnly)
                if (!sharedOnly) onSharedByMeChange(false)
              }}
            >
              <IconCheck
                className={cn(
                  'h-4 w-4',
                  sharedOnly ? 'opacity-100' : 'opacity-0',
                )}
              />
              <IconUsersGroup className="h-4 w-4" />
              Shared with me
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                onSharedByMeChange(!sharedByMe)
                if (!sharedByMe) onSharedOnlyChange(false)
              }}
            >
              <IconCheck
                className={cn(
                  'h-4 w-4',
                  sharedByMe ? 'opacity-100' : 'opacity-0',
                )}
              />
              <IconUsersGroup className="h-4 w-4" />
              Shared by me
            </DropdownMenuItem>
            {(sharedOnly || sharedByMe) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    onSharedOnlyChange(false)
                    onSharedByMeChange(false)
                  }}
                >
                  <IconX className="h-4 w-4" />
                  Clear filter
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View dropdown — layout modes + Explorer-style Show toggles. */}
        <DropdownMenu>
          {' '}
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 gap-1.5" title="View">
              <IconLayout2 className="h-4 w-4" />
              View
              <IconChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Layout</DropdownMenuLabel>
            {DOCUMENT_VIEW_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onSelect={() => onViewChange(option.key)}
              >
                <IconCheck
                  className={cn(
                    'h-4 w-4',
                    view === option.key ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconList className="h-4 w-4" />
                Show
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-52">
                <DropdownMenuItem onSelect={() => togglePref('navigationPane')}>
                  <IconCheck
                    className={cn(
                      'h-4 w-4',
                      prefs.navigationPane ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <IconLayoutSidebar className="h-4 w-4" />
                  Navigation pane
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => togglePref('compact')}>
                  <IconCheck
                    className={cn(
                      'h-4 w-4',
                      prefs.compact ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <IconBoxMultiple className="h-4 w-4" />
                  Compact view
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => togglePref('checkBoxes')}>
                  <IconCheck
                    className={cn(
                      'h-4 w-4',
                      prefs.checkBoxes ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <IconCheckbox className="h-4 w-4" />
                  Item check boxes
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => togglePref('previewPane')}>
                  <IconCheck
                    className={cn(
                      'h-4 w-4',
                      prefs.previewPane ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <IconLayoutSidebar className="h-4 w-4 rotate-180" />
                  Preview pane
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          className="h-8 gap-1.5"
          onClick={onCreateFolder}
        >
          <IconFolderPlus className="h-4 w-4" />
          New folder
        </Button>
        <Button className="h-8 gap-1.5" onClick={onUpload}>
          <IconPlus className="h-4 w-4" />
          Upload
        </Button>
      </div>
    </div>
  )
}
