'use client'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { IconAlertTriangle } from '@tabler/icons-react'

import { showSubmittedData } from '@/utils/show-submitted-data'
import { useAppModuleFeatureDeleteMutation } from '../data/queryOptions'
import type { AppModuleFeature } from '../data/schema'


interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AppModuleFeature
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const { mutate: deleteAppModuleFeature } = useAppModuleFeatureDeleteMutation()


  const handleDelete = () => {
    // if (value.trim() !== String(currentRow.id)) return

    //(false)
    showSubmittedData(currentRow, 'The following user has been deleted:')
    deleteAppModuleFeature(currentRow.id, {
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
          Delete App Module Feature
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action will permanently remove the app module feature with the status of{' '}
            <span className='font-bold'>
              {currentRow.status.toUpperCase()}
            </span>{' '}
            from the system. This cannot be undone.
          </p>



          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be carefull, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
