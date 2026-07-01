'use client'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useMenuDeleteMutation } from '../data/queryOptions'
import type { Menu } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Menu
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const { mutate: deleteEntry } = useMenuDeleteMutation()

  const handleDelete = () => {
    deleteEntry(currentRow.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
      onError: (error) => {
        console.error('Delete failed:', error)
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{' '}
          Delete Menu Entry
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.menuName}</span>?
            <br />
            This will permanently remove this menu entry from the system.
            {currentRow.isGroup && (
              <span className='block mt-1 text-amber-600'>
                Note: This is a group menu. Deleting it will NOT delete its children
                (they will become orphaned with no parent).
              </span>
            )}
          </p>
          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This operation cannot be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
