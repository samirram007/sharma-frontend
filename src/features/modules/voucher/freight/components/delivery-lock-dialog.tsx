import React, { useEffect, useState } from 'react'
import { Lock, LockOpen, Save } from 'lucide-react'
import { useDeliveryLockMutation } from '../data/queryOptions'
import {
  DELIVERY_LOCK_REASONS,
  deliveryLockMoment,
  deliveryLockReasonLabel,
  toDateTimeLocalValue,
} from '../../shared/delivery-lock'
import { useDeliveryLockPermissions } from '../../shared/delivery-lock-permissions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { date_format } from '@/utils/removeEmptyStrings'
import type { VoucherSchema } from '../../data-schema/voucher-schema'
import { useFreightContext } from '../contexts/freight-context'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucher: VoucherSchema
}

/**
 * Lock / unlock a delivery note (postpone) from the Freight screen.
 *
 * The lock records a preset reason (vehicle failure, uncertain situation, …)
 * plus an optional note and is allowed before AND after the freight bill is
 * prepared. It is an indicator only — nothing is blocked downstream.
 *
 * Mounted once by the FreightProvider (above the grid), so a row unmount
 * during the query refetch that follows a save can't destroy it mid-submit.
 */
const DeliveryLockDialogImpl = ({ open, onOpenChange, voucher }: Props) => {
  const isLocked = !!voucher.deliveryLocked
  const [reason, setReason] = useState<string>('')
  const [note, setNote] = useState<string>('')
  // `datetime-local` values. Empty means "use the current time" (the API
  // fills in the moment server-side).
  const [lockedAt, setLockedAt] = useState<string>('')
  const [unlockedAt, setUnlockedAt] = useState<string>('')
  const lockMutation = useDeliveryLockMutation()
  const { setLockTarget, setLockReason } = useFreightContext()
  // Postponing needs DELIVERY_LOCK_POSTPONE, releasing DELIVERY_LOCK_RELEASE.
  // The backend enforces both; here the buttons simply follow the same rule.
  const { canPostpone, canRelease } = useDeliveryLockPermissions()

  // Forward open/close to the freight context so its own lock dialog state
  // (mounted above the grid) stays in sync when this dialog is opened from
  // a row action.
  const handleOpenChange: NonNullable<Props['onOpenChange']> = (nextOpen) => {
    if (nextOpen) {
      setLockTarget(voucher)
      setLockReason(voucher.deliveryLockReason ?? '')
    } else {
      setLockTarget(null)
      setLockReason('')
    }
    onOpenChange(nextOpen)
  }

  // Re-seed the form whenever the dialog opens on a (possibly different) row.
  useEffect(() => {
    if (!open) return
    setReason(voucher.deliveryLockReason ?? '')
    setNote(voucher.deliveryLockNote ?? '')
    // Only prefill the lock moment for an *active* lock — a released row's
    // history shouldn't seed a new postponement.
    setLockedAt(
      voucher.deliveryLocked && voucher.deliveryLockedAt
        ? toDateTimeLocalValue(voucher.deliveryLockedAt)
        : '',
    )
    setUnlockedAt('')
  }, [
    open,
    voucher.deliveryLockReason,
    voucher.deliveryLockNote,
    voucher.deliveryLockedAt,
  ])

  const close = () => onOpenChange(false)

  /** `datetime-local` → ISO; empty stays null so the API uses "now". */
  const toIso = (value: string): string | null => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  const submit = (lock: boolean) => {
    if (!voucher.id) return
    lockMutation.mutate(
      {
        id: voucher.id,
        lock,
        payload: lock
          ? {
              reason,
              note: note || null,
              locked_at: toIso(lockedAt),
            }
          : { unlocked_at: toIso(unlockedAt) },
      },
      { onSuccess: close },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isLocked ? (
              <LockOpen className="h-4 w-4 text-amber-600" />
            ) : (
              <Lock className="h-4 w-4 text-rose-600" />
            )}
            {isLocked ? 'Postponed delivery' : 'Postpone delivery'}
          </DialogTitle>
          <DialogDescription>
            Delivery note{' '}
            <span className="font-semibold text-foreground">
              {voucher.voucherNo}
            </span>
            {voucher.voucherDate
              ? ` dated ${date_format(voucher.voucherDate)}`
              : ''}
            {voucher.party?.name ? ` · ${voucher.party.name}` : ''} — the lock
            records why the delivery is held back (e.g. vehicle failure) and is
            shown on the Freight grid, Day Book and reports.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="delivery-lock-reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="delivery-lock-reason" className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_LOCK_REASONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLocked && (
              <p className="text-xs text-muted-foreground">
                Currently:{' '}
                <span className="font-medium text-foreground">
                  {deliveryLockReasonLabel(voucher.deliveryLockReason) ??
                    'locked'}
                </span>
                {deliveryLockMoment(voucher.deliveryLockedAt)
                  ? ` · since ${deliveryLockMoment(voucher.deliveryLockedAt)}`
                  : ''}
                {voucher.deliveryLockedByName
                  ? ` · by ${voucher.deliveryLockedByName}`
                  : ''}
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="delivery-lock-locked-at">Postponed at</Label>
              <Input
                id="delivery-lock-locked-at"
                type="datetime-local"
                value={lockedAt}
                onChange={(event) => setLockedAt(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use the current time.
              </p>
            </div>
            {isLocked && (
              <div className="space-y-1.5">
                <Label htmlFor="delivery-lock-unlocked-at">Released at</Label>
                <Input
                  id="delivery-lock-unlocked-at"
                  type="datetime-local"
                  value={unlockedAt}
                  onChange={(event) => setUnlockedAt(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used when you unlock — empty means now.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delivery-lock-note">
              Details{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="delivery-lock-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="e.g. Vehicle broke down on NH-33, replacement vehicle pending"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          {isLocked && canRelease && (
            <Button
              variant="outline"
              onClick={() => submit(false)}
              disabled={lockMutation.isPending}
            >
              <LockOpen className="mr-2 h-4 w-4" />
              Unlock
            </Button>
          )}
          {canPostpone && (
            <Button
              onClick={() => submit(true)}
              disabled={!reason || lockMutation.isPending}
              title={
                !reason ? 'Select a reason to postpone this delivery' : undefined
              }
            >
              <Save className="mr-2 h-4 w-4" />
              {isLocked
                ? lockMutation.isPending
                  ? 'Saving…'
                  : 'Save reason'
                : lockMutation.isPending
                  ? 'Locking…'
                  : 'Lock delivery'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const DeliveryLockDialogInner = React.memo(DeliveryLockDialogImpl)

export default DeliveryLockDialogInner
