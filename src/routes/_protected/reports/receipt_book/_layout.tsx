import ReportProvider from '@/features/reports/context/report-context'
import ReportLayout from '@/features/reports/layouts/report-layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_protected/reports/receipt_book/_layout',
)({
    component: () => {
        return (
            <ReportProvider>
                <ReportLayout />
            </ReportProvider>
        )
    }
})


