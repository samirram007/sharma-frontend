
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import Payroll from '@/features/masters/payroll'
import PayrollProvider from '@/features/masters/payroll/context/payroll-context'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/payroll/_layout')({
  component: () => {
    return (
      <PayrollProvider>
        <Payroll />
      </PayrollProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})

