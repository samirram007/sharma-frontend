import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  IconSearch,
  IconX,
  IconPlus,
  IconFolderPlus,
  IconLayoutGrid,
  IconList,
  IconUsersGroup,
} from '@tabler/icons-react'

export type DocumentView = 'cards' | 'table'

interface Props {
  search: string
  onSearchChange: (search: string) => void
  view: DocumentView
  onViewChange: (view: DocumentView) => void
  onUpload: () => void
  onCreateFolder: () => void
  /** Show only documents other people shared with the current user. */
  sharedOnly: boolean
  onSharedOnlyChange: (sharedOnly: boolean) => void
  /** Show only documents the current user shared outward. */
  sharedByMe: boolean
  onSharedByMeChange: (sharedByMe: boolean) => void
}

export function DocumentToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
  onUpload,
  onCreateFolder,
  sharedOnly,
  onSharedOnlyChange,
  sharedByMe,
  onSharedByMeChange,
}: Props) {
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
        <Button
          variant={sharedOnly ? 'secondary' : 'outline'}
          className={`h-8 gap-1.5 ${sharedOnly ? 'ring-1 ring-primary/40' : ''}`}
          onClick={() => onSharedOnlyChange(!sharedOnly)}
          title="Documents other people shared with you"
        >
          <IconUsersGroup className="h-4 w-4" />
          Shared with me
        </Button>
        <Button
          variant={sharedByMe ? 'secondary' : 'outline'}
          className={`h-8 gap-1.5 ${sharedByMe ? 'ring-1 ring-primary/40' : ''}`}
          onClick={() => onSharedByMeChange(!sharedByMe)}
          title="Documents you shared with others"
        >
          <IconUsersGroup className="h-4 w-4" />
          Shared by me
        </Button>
        <div className="flex items-center rounded-md border">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-none ${view === 'cards' ? 'bg-muted' : ''}`}
            onClick={() => onViewChange('cards')}
            title="Card view"
          >
            <IconLayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-none ${view === 'table' ? 'bg-muted' : ''}`}
            onClick={() => onViewChange('table')}
            title="Table view"
          >
            <IconList className="h-4 w-4" />
          </Button>
        </div>

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
