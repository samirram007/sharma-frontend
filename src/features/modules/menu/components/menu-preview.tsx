import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { resolveIcon } from '@/features/modules/menu/data/menu-icon-map'
import { cn } from '@/lib/utils'
import { ChevronRight, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { MenuTreeNode } from '../data/schema'

interface MenuPreviewProps {
  tree: MenuTreeNode[]
  compact?: boolean
}

export default function MenuPreview({ tree, compact = false }: MenuPreviewProps) {
  if (!tree || tree.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-10 text-muted-foreground'>
        <p className='text-xs font-medium'>No menu items to preview</p>
        <p className='text-[10px]'>Add entries in the tree view first.</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-full space-y-0.5 rounded-lg bg-sidebar p-2',
        compact ? 'max-w-full' : 'mx-auto max-w-sm',
      )}
    >
      {/* Preview header */}
      <div className='mb-2 flex items-center gap-2 border-b border-sidebar-border/60 pb-1.5'>
        <div className='flex h-5 w-5 items-center justify-center rounded bg-blue-600 shadow-sm'>
          <span className='text-[8px] font-bold text-white'>A</span>
        </div>
        <div className='flex min-w-0 flex-col leading-none'>
          <span className='truncate text-[10px] font-bold text-sidebar-foreground'>
            SIDEBAR PREVIEW
          </span>
          <span className='truncate text-[8px] font-medium text-sidebar-foreground/40'>
            Drag items above to customize
          </span>
        </div>
      </div>

      {tree.map((group) => (
        <PreviewGroup key={group.id} node={group} depth={0} compact={compact} />
      ))}
    </div>
  )
}

// ── Preview Group ────────────────────────────────────────────────────────────

interface PreviewGroupProps {
  node: MenuTreeNode
  depth: number
  compact: boolean
}

function PreviewGroup({ node, depth, compact }: PreviewGroupProps) {
  const [isOpen, setIsOpen] = useState(depth < 2)
  const hasChildren = node.children && node.children.length > 0
  const isRoot = depth === 0
  const Icon = resolveIcon(node.icon ?? undefined)

  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5'
  const iconInnerSize = compact ? 'h-2.5 w-2.5' : 'h-3 w-3'

  return (
    <div className='group/preview'>
      {isRoot ? (
        // Root level — render as group header
        <div className='mb-0.5 px-1.5 pt-1.5'>
          <div className='flex items-center gap-1.5'>
            {Icon && (
              <Icon
                className={cn(
                  'text-sidebar-foreground/40',
                  compact ? 'h-3 w-3' : 'h-3.5 w-3.5',
                )}
              />
            )}
            <span
              className={cn(
                'font-semibold uppercase tracking-wider text-sidebar-foreground/40',
                compact ? 'text-[9px]' : 'text-[10px]',
              )}
            >
              {node.menuName}
            </span>
            {node.isGroup && (
              <span
                className={cn(
                  'rounded bg-sidebar-accent px-1 py-px font-medium text-sidebar-accent-foreground',
                  compact ? 'text-[7px]' : 'text-[8px]',
                )}
              >
                Group
              </span>
            )}
            {!node.isVisible && (
              <span className='flex items-center gap-0.5 text-[8px] text-amber-500'>
                <EyeOff className='h-2.5 w-2.5' />
              </span>
            )}
          </div>
        </div>
      ) : (
        // Nested level — render as menu item
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-md transition-colors',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              !node.isVisible && 'opacity-50',
              compact ? 'px-1.5 py-1' : 'px-2 py-1.5',
            )}
          >
            {/* Expand indicator */}
            <div className='flex w-3.5 items-center justify-center'>
              {hasChildren || node.isGroup ? (
                <CollapsibleTrigger asChild>
                  <button className='flex items-center justify-center text-sidebar-foreground/30 hover:text-sidebar-foreground'>
                    <ChevronRight
                      className={cn(
                        'transition-transform duration-200',
                        compact ? 'h-2.5 w-2.5' : 'h-3 w-3',
                        isOpen && 'rotate-90',
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
              ) : (
                <span className='w-3.5' />
              )}
            </div>

            {/* Icon */}
            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded border border-sidebar-border bg-sidebar',
                iconSize,
              )}
            >
              {Icon ? (
                <Icon className={cn('text-sidebar-foreground/60', iconInnerSize)} />
              ) : (
                <span className='rounded bg-sidebar-foreground/10' />
              )}
            </div>

            {/* Name */}
            <span
              className={cn(
                'flex-1 truncate text-sidebar-foreground',
                node.isGroup && 'font-semibold',
                compact ? 'text-xs' : 'text-sm font-medium',
              )}
            >
              {node.menuName}
            </span>

            {/* Route badge */}
            {node.route && !compact && (
              <code className='hidden truncate rounded bg-sidebar-accent/50 px-1 py-0.5 text-[8px] font-mono text-sidebar-foreground/30 sm:inline-block max-w-16'>
                {node.route}
              </code>
            )}
          </div>

          {/* Children */}
          {hasChildren && (
            <CollapsibleContent>
              <div
                className={cn(
                  'border-l border-sidebar-border/30 pl-1',
                  compact ? 'ml-2' : 'ml-3',
                )}
              >
                {node.children.map((child) => (
                  <PreviewGroup
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                    compact={compact}
                  />
                ))}
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      )}
    </div>
  )
}
