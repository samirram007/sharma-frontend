import BalanceSheet from '@/features/reports/balance-sheet'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/reports/balance_sheet/')({
  component: BalanceSheet,
})
