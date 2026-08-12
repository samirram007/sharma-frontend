import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { ArrowRight, FileText, Package, Receipt, Truck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/_protected/transactions/')({
  component: RouteComponent,
})

const quickActions = [
  {
    title: 'Freight Management',
    description:
      'Track dispatch details, transporter info, and freight calculation.',
    to: '/transactions/freight',
    icon: Truck,
    status: 'Active',
  },
  {
    title: 'Receipt Note',
    description: 'Capture inward entries and validate received stock quickly.',
    to: '/transactions/vouchers/receipt_note',
    icon: Receipt,
    status: 'In Progress',
  },
  {
    title: 'Delivery Note',
    description:
      'Prepare outward movement records with party and item details.',
    to: '/transactions/vouchers/delivery_note',
    icon: Package,
    status: 'In Progress',
  },
]

const relatedTopics = [
  {
    title: 'Voucher Workbench',
    description:
      'Open voucher categories and post transactional entries by type.',
    to: '/transactions/vouchers',
  },
  {
    title: 'Reports & Reconciliation',
    description:
      'Review stock summary and day-book outcomes after posting vouchers.',
    to: '/reports/stock_summary',
  },
  {
    title: 'Day Book Drilldown',
    description:
      'Analyze posting flow and verify transaction trails in one place.',
    to: '/reports/day_book',
  },
]

function RouteComponent() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.14),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.14),transparent_35%)] p-6 sm:p-8">
          <Badge variant="secondary" className="mb-3">
            Transaction Center
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Operations Hub
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Manage freight, voucher flow, and posting lifecycle from a single
            place. Use the quick actions below to jump into high-frequency
            transaction tasks.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <span className="text-xs text-muted-foreground">
            Most used modules
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.title}
                className="border-border/70 transition hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-0">
                  <Badge variant="outline">{action.status}</Badge>
                  <Link
                    to={action.to}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Related Topics</h2>
        <Card className="border-border/70">
          <CardContent className="grid gap-3 py-6 md:grid-cols-3">
            {relatedTopics.map((topic) => (
              <Link
                key={topic.title}
                to={topic.to}
                className="group rounded-xl border bg-background p-4 transition hover:border-primary/40 hover:bg-accent/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{topic.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {topic.description}
                    </p>
                  </div>
                  <FileText className="mt-0.5 h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
