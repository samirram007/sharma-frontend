import { ShareSettingsPanel } from './share-settings-panel'
import type { DocumentNode } from '@/features/modules/document/data/schema'

interface DocumentShareDialogProps {
  node: DocumentNode | null
  onClose: () => void
}

/**
 * Standalone Share dialog — a thin wrapper around ShareSettingsPanel (which
 * also powers the Properties dialog's Sharing tab) so both entry points
 * offer the identical full sharing settings with per-target action grants.
 */
export function DocumentShareDialog({
  node,
  onClose,
}: DocumentShareDialogProps) {
  if (!node) return null
  return <ShareSettingsPanel node={node} onClose={onClose} />
}
