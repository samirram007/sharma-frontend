'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryClient } from '@tanstack/react-query'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'
import axiosClient from '@/utils/axios-client'
import { removeEmptyStrings } from '@/utils/removeEmptyStrings'
import { ConfirmDialog } from '@/components/confirm-dialog'

type ActiveInactiveStatus = 'active' | 'inactive'

interface StatusToggleRow {
  id?: number | string | null
  status?: string | null
  name?: string | null
  code?: string | null
  [key: string]: unknown
}

interface StatusToggleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Display name of the module, e.g. "Department". */
  moduleName: string
  /** API resource path, e.g. "/departments" (must start with a slash). */
  apiPath: string
  /** The row whose status is being toggled. */
  currentRow: StatusToggleRow
  /** Query keys to invalidate after a successful toggle so the list refreshes. */
  queryKey?: unknown[]
  /** Extra row facts to show in the caution details (label/value pairs). */
  extraDetails?: Array<{
    label: string
    value: string | number | null | undefined
  }>
}

/**
 * Replaces the "fake delete" flow on master list pages with a real status
 * toggle: records are never hard-deleted — "Delete" marks them inactive and
 * the same action on an inactive row reactivates it.
 *
 * The dialog shows a detailed caution *before* the change (row identity,
 * current status, consequences), requires typing the record id to confirm,
 * then persists the new status through the backend and surfaces the actual
 * outcome (success message or the backend's error) *after*.
 */
export function StatusToggleDialog({
  open,
  onOpenChange,
  moduleName,
  apiPath,
  currentRow,
  queryKey,
  extraDetails,
}: StatusToggleDialogProps) {
  const queryClient = useQueryClient()
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // An "active" row gets deactivated; any other status gets reactivated.
  const activating = currentRow.status !== 'active'
  const target: ActiveInactiveStatus = activating ? 'active' : 'inactive'
  const verb = activating ? 'Activate' : 'Deactivate'
  const verbPast = activating ? 'activated' : 'deactivated'

  const handleConfirm = async () => {
    if (!currentRow.id || value.trim() !== String(currentRow.id)) return

    setSubmitting(true)
    try {
      const payload = removeEmptyStrings({
        ...currentRow,
        status: target,
      }) as Record<string, unknown>

      await axiosClient.put(`${apiPath}/${currentRow.id}`, payload)

      if (queryKey?.length) {
        queryClient.invalidateQueries({ queryKey })
      }

      // Show the explicit outcome (the backend also echoes "... updated
      // successfully" for every update, which would hide what actually changed).
      toast.success(`${moduleName} ${verbPast} successfully`)
      setValue('')
      onOpenChange(false)
    } catch (error) {
      handleToggleError(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleError = (error: unknown) => {
    const response = (error as { response?: { data?: unknown } })?.response
      ?.data as
      { errors?: Record<string, string[]>; message?: string } | undefined

    if (response?.errors) {
      Object.entries(response.errors).forEach(([, messages]) => {
        messages.forEach((message) => {
          const finalMessage = message.includes('Session expired')
            ? 'Your session has expired. Please log in again.'
            : message
          toast.error(finalMessage, { duration: 6000 })
        })
      })
    } else if (response?.message) {
      toast.error(response.message, { duration: 6000 })
    } else {
      toast.error('Network or server error occurred.', { duration: 6000 })
    }
  }

  const details: Array<{
    label: string
    value: string | number | null | undefined
  }> = [
    { label: 'Name', value: currentRow.name },
    { label: 'Code', value: currentRow.code },
    { label: 'ID', value: currentRow.id },
    { label: 'Current status', value: currentRow.status },
    ...(extraDetails ?? []),
  ].filter((d) => d.value !== null && d.value !== undefined && d.value !== '')

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleConfirm}
      disabled={
        !currentRow.id || value.trim() !== String(currentRow.id) || submitting
      }
      isLoading={submitting}
      title={
        <span className={activating ? '' : 'text-destructive'}>
          {!activating && (
            <IconAlertTriangle
              className="stroke-destructive mr-1 inline-block"
              size={18}
            />
          )}
          {verb} {moduleName}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to {activating ? 'activate' : 'deactivate'}{' '}
            <span className="font-bold">
              {currentRow.name ?? `#${currentRow.id}`}
            </span>
            ?
          </p>

          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <div className="mb-1 font-medium">Record details</div>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.label} className="flex gap-1">
                  <dt className="text-muted-foreground">{d.label}:</dt>
                  <dd className="font-medium capitalize">{String(d.value)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {activating ? (
            <Alert>
              <AlertTitle>Reactivating record</AlertTitle>
              <AlertDescription>
                This {moduleName.toLowerCase()} will become active again and
                will be available in new selections.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>This does not delete the record</AlertTitle>
              <AlertDescription>
                {moduleName} is marked{' '}
                <span className="font-bold">inactive</span> instead of being
                deleted, so the record history stays intact. Inactive{' '}
                {moduleName.toLowerCase()}s are hidden from new selections
                across the application. You can reactivate it at any time from
                this same action.
              </AlertDescription>
            </Alert>
          )}

          <Label className="my-2 block">
            Type the record id ({currentRow.id ?? '-'}) to confirm{' '}
            {activating ? 'activation' : 'deactivation'}:
            <Input
              className="mt-1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type ${currentRow.id ?? '-'} to confirm`}
            />
          </Label>
        </div>
      }
      confirmText={verb}
      destructive={!activating}
    />
  )
}
