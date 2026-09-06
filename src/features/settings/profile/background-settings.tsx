import { useState } from 'react'
import { toast } from 'sonner'
import { IconPhoto, IconPhotoOff, IconRefresh } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  appearance,
  useWallpaper,
  WALLPAPER_OPACITY_MAX,
  WALLPAPER_OPACITY_MIN,
} from '@/features/modules/document/components/appearance-store'
import { ProfilePhotoDialog } from '@/features/modules/document/components/profile-photo-dialog'
import { documentUrl } from '@/features/modules/document/data/api'
import type { DocumentNode } from '@/features/modules/document/data/schema'

/** Preset swatches offered for the workspace backdrop color. */
const COLOR_SWATCHES = [
  { label: 'None', value: null },
  { label: 'Slate', value: '#0f172a' },
  { label: 'Indigo', value: '#312e81' },
  { label: 'Teal', value: '#134e4a' },
  { label: 'Amber', value: '#78350f' },
  { label: 'Rose', value: '#881337' },
]

/**
 * Profile → Background: choose/remove a background image from the documents
 * system, tune its opacity, and pick a backdrop color (preset or custom).
 * Everything lives in the appearance store, so the layout updates live.
 */
export default function BackgroundSettings() {
  const { url, color, opacity } = useWallpaper()
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="space-y-5">
      {/* Image controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            Background image
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Pick an image from your documents or upload a new one. The change
            applies live across the workspace.
          </p>
        </div>

        {/* Preview */}
        <div
          className="relative mb-4 flex h-36 items-center justify-center overflow-hidden rounded-xl border border-slate-200"
          style={{
            backgroundColor: color ?? undefined,
            backgroundImage: url ? `url(${url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!url && (
            <p className="rounded-md bg-white/80 px-3 py-1 text-sm text-slate-500">
              No background image set
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={() => setPickerOpen(true)}>
            <IconPhoto className="h-4 w-4" />
            {url ? 'Change image' : 'Add image'}
          </Button>
          {url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                appearance.setWallpaper(null)
                toast.success('Background image removed.')
              }}
            >
              <IconPhotoOff className="h-4 w-4" />
              Remove image
            </Button>
          )}
        </div>
      </div>

      {/* Opacity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            Image opacity
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Fade the background image so content stays readable.
          </p>
        </div>
        <div className="flex items-center gap-4 md:max-w-md">
          <Slider
            value={[opacity]}
            min={WALLPAPER_OPACITY_MIN}
            max={WALLPAPER_OPACITY_MAX}
            step={0.05}
            disabled={!url}
            onValueChange={(values: number[]) =>
              appearance.setWallpaperOpacity(values[0])
            }
            className="flex-1"
            aria-label="Background image opacity"
          />
          <span className="w-12 text-right text-sm tabular-nums text-slate-600">
            {Math.round(opacity * 100)}%
          </span>
        </div>
        {url && opacity < 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => appearance.setWallpaperOpacity(1)}
          >
            <IconRefresh className="h-4 w-4" />
            Reset opacity
          </Button>
        )}
      </div>

      {/* Color */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            Background color
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Solid color behind the workspace. Shown instead of the image when no
            image is set.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.label}
              type="button"
              title={swatch.label}
              aria-label={`Background color: ${swatch.label}`}
              className={`h-9 w-9 rounded-full border transition ${
                color === swatch.value
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'border-slate-200 hover:scale-105'
              }`}
              style={{
                backgroundColor: swatch.value ?? 'transparent',
                backgroundImage:
                  swatch.value === null
                    ? 'linear-gradient(135deg, transparent 45%, #ef4444 45%, #ef4444 55%, transparent 55%)'
                    : undefined,
              }}
              onClick={() => {
                appearance.setWallpaperColor(swatch.value)
                toast.success(
                  swatch.value
                    ? `Background color set to ${swatch.label.toLowerCase()}.`
                    : 'Background color cleared.',
                )
              }}
            />
          ))}

          {/* Custom color picker */}
          <label
            className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border border-slate-200 transition hover:scale-105"
            title="Custom color"
          >
            <span
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
              }}
            />
            <input
              type="color"
              aria-label="Custom background color"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              value={color ?? '#1e293b'}
              onChange={(event) =>
                appearance.setWallpaperColor(event.target.value)
              }
            />
          </label>
        </div>
      </div>

      {/* Reuse the documents picker as a background chooser. */}
      <ProfilePhotoDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        currentPhotoUrl={url}
        dialogTitle="Choose background image"
        dialogDescription="Pick an image from your documents, upload one, or drop a file here."
        confirmLabel="Use as background"
        onConfirm={(node: DocumentNode) => {
          appearance.setWallpaper(documentUrl(node.id, 'preview', 'fetch'))
          setPickerOpen(false)
          toast.success(`Background set to "${node.name}".`)
        }}
      />
    </div>
  )
}
