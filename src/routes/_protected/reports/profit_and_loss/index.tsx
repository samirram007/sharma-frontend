import ProfitAndLoss from '@/features/reports/pofit-and-loss'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/reports/profit_and_loss/')({
  component: ProfitAndLoss,
})

