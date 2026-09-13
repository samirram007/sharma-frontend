import { cn } from '@/lib/utils'

/**
 * Folder accent colours — the palette shown when creating a folder or
 * changing its colour from the context menu. The default (no colour) folder
 * icon is amber, so amber is intentionally excluded from this list.
 */
export const FOLDER_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Slate', value: '#64748b' },
] as const

/** The default (uncoloured) folder icon colour — matches FileThumbnail. */
export const DEFAULT_FOLDER_COLOR = '#f59e0b'

interface FolderColorPickerProps {
  /** Selected colour (hex); null/undefined = default. */
  value: string | null | undefined
  onChange: (color: string | null) => void
  className?: string
}

/**
 * Compact row of colour swatches used by the create-folder dialog and the
 * folder context menu. The first swatch is "Default" (amber) and clears the
 * colour back to the default folder icon.
 */
export function FolderColorPicker({
  value,
  onChange,
  className,
}: FolderColorPickerProps) {
  const swatchClass = (active: boolean) =>
    cn(
      'h-6 w-6 shrink-0 rounded-full border transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      active && 'ring-2 ring-ring ring-offset-2',
    )

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <button
        type="button"
        title="Default"
        aria-label="Default folder colour"
        onClick={() => onChange(null)}
        className={swatchClass(!value)}
        style={{ backgroundColor: DEFAULT_FOLDER_COLOR }}
      />
      {FOLDER_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          title={color.name}
          aria-label={`Folder colour ${color.name}`}
          onClick={() => onChange(color.value)}
          className={swatchClass(value === color.value)}
          style={{ backgroundColor: color.value }}
        />
      ))}
    </div>
  )
}
