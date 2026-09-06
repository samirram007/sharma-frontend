import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useSearch } from '@/core/contexts/search-context'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { resolveIcon } from '@/features/modules/menu/data/menu-icon-map'
import type { MenuTreeItem } from '@/features/modules/menu/data/menu-tree-types'
import { canonicalHref, readTabs } from '@/layouts/lib/recent-pages'
import { useNavigate } from '@tanstack/react-router'
import { useMemo, type ElementType } from 'react'
import {
  IconArrowUpRight,
  IconLayoutDashboard,
  IconPlus,
} from '@tabler/icons-react'

/** Keyboard hints shown in the footer of the dialog. */
const KBD_HINTS: Array<{ keys: string; label: string }> = [
  { keys: '↑↓', label: 'navigate' },
  { keys: '↵', label: 'open' },
  { keys: 'esc', label: 'close' },
]

interface NavEntry {
  title: string
  route: string
  icon: ElementType
  section: string
}

/** Shortcuts always offered at the top, no matter what has been visited. */
const DEFAULT_SHORTCUTS: NavEntry[] = [
  {
    title: 'Dashboard',
    route: '/dashboard',
    icon: IconLayoutDashboard,
    section: 'Shortcuts',
  },
  {
    title: 'Shortcuts',
    route: '/new-tab',
    icon: IconPlus,
    section: 'Shortcuts',
  },
]

/** Flatten the permission-filtered menu tree into searchable page entries. */
function buildEntries(tree: MenuTreeItem[]): NavEntry[] {
  const out: NavEntry[] = []
  const seen = new Set<string>()
  const walk = (nodes: MenuTreeItem[], section = '') => {
    for (const node of nodes) {
      const nextSection = node.route || !node.menuName ? section : node.menuName
      if (node.route) {
        const route = canonicalHref(node.route)
        if (route && !seen.has(route)) {
          seen.add(route)
          out.push({
            title: node.menuName,
            route,
            icon: resolveIcon(node.icon ?? undefined),
            section: nextSection,
          })
        }
      }
      if (node.children?.length) walk(node.children, nextSection)
    }
  }
  walk(tree)
  return out
}

/**
 * Command palette behind the header Search (⌘K / Ctrl-K).
 *
 * Behaves like a classic launcher: type to filter a flat command list of
 * shortcuts, recently visited pages and every page the current user can see,
 * then use ↑↓ + ↵ (or click) to open one. Group headings update live as the
 * query filters entries so the list always reads like a searchable command
 * list instead of a static menu.
 */
export function SearchCommandMenu() {
  const { open, setOpen } = useSearch()
  const navigate = useNavigate()
  const { menuTree } = useAuth()

  const entries = useMemo(() => buildEntries(menuTree ?? []), [menuTree])
  const entryByRoute = useMemo(() => {
    const map = new Map<string, NavEntry>()
    for (const entry of entries) map.set(entry.route, entry)
    return map
  }, [entries])
  const recents = useMemo(() => {
    const out: NavEntry[] = []
    for (const page of readTabs()) {
      const entry = entryByRoute.get(canonicalHref(page.href))
      if (entry && !out.some((e) => e.route === entry.route)) out.push(entry)
      if (out.length >= 6) break
    }
    return out
  }, [entryByRoute])

  const openPage = (route: string) => {
    setOpen(false)
    navigate({ to: route })
  }

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <IconArrowUpRight
          aria-hidden
          size={14}
          className="text-muted-foreground"
        />
        <CommandInput placeholder="Search pages, modules, vouchers…" />
      </div>
      <CommandList className="max-h-[55vh] overflow-y-auto">
        <CommandEmpty>No pages match your search.</CommandEmpty>
        {DEFAULT_SHORTCUTS.length > 0 && (
          <CommandGroup heading="Shortcuts">
            {DEFAULT_SHORTCUTS.map((shortcut) => {
              const Icon = shortcut.icon
              return (
                <CommandItem
                  key={`shortcut-${shortcut.route}`}
                  value={`${shortcut.title} ${shortcut.route}`}
                  onSelect={() => openPage(shortcut.route)}
                >
                  <Icon size={15} className="mr-2 text-muted-foreground" />
                  <span>{shortcut.title}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {recents.length > 0 && (
          <CommandGroup heading="Recent">
            {recents.map((recent) => {
              const Icon = recent.icon
              return (
                <CommandItem
                  key={`recent-${recent.route}`}
                  value={`${recent.title} ${recent.route}`}
                  onSelect={() => openPage(recent.route)}
                >
                  <Icon size={15} className="mr-2 text-muted-foreground" />
                  <span>{recent.title}</span>
                  <span className="ml-auto pl-4 text-xs text-muted-foreground">
                    {recent.section}
                  </span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {entries
          .filter((entry) => entry.route !== '/dashboard')
          .reduce<Array<{ section: string; items: NavEntry[] }>>(
            (groups, entry) => {
              const last = groups[groups.length - 1]
              if (last && last.section === entry.section) {
                last.items.push(entry)
              } else {
                groups.push({ section: entry.section, items: [entry] })
              }
              return groups
            },
            [],
          )
          .map((group) => (
            <CommandGroup
              key={`pages-${group.section}`}
              heading={group.section}
            >
              {group.items.map((entry) => {
                const Icon = entry.icon
                return (
                  <CommandItem
                    key={`pages-${entry.route}`}
                    value={`${entry.title} ${entry.route}`}
                    onSelect={() => openPage(entry.route)}
                  >
                    <Icon size={15} className="mr-2 text-muted-foreground" />
                    <span>{entry.title}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
      </CommandList>
      <div className="flex items-center gap-3 border-t px-3 py-2 text-[11px] text-muted-foreground">
        {KBD_HINTS.map((hint) => (
          <span key={hint.label} className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
              {hint.keys}
            </kbd>
            {hint.label}
          </span>
        ))}
      </div>
    </CommandDialog>
  )
}
