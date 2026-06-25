import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpen,
  CircleDollarSign,
  PackageSearch,
  TrendingUp,
  Truck,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/_protected/reports/')({
  component: RouteComponent,
})

const headlineCards = [
  {
    title: 'Day Book',
    description: 'Track posting flow and verify voucher chronology for the day.',
    to: '/reports/day_book',
    icon: BookOpen,
    tag: 'Operations',
  },
  {
    title: 'Stock Summary',
    description: 'Monitor stock position across item, zone, godown, and voucher views.',
    to: '/reports/stock_summary',
    icon: PackageSearch,
    tag: 'Inventory',
  },
  {
    title: 'Freight Analytics',
    description: 'Review freight cost movement by transporter, godown, and voucher.',
    to: '/reports/freight',
    icon: Truck,
    tag: 'Logistics',
  },
]

const financeTopics = [
  {
    title: 'Profit & Loss',
    description: 'Analyze income and expense movement for period performance.',
    to: '/reports/profit_and_loss',
    icon: TrendingUp,
  },
  {
    title: 'Balance Sheet',
    description: 'Review assets, liabilities, and net position snapshot.',
    to: '/reports/balance_sheet',
    icon: CircleDollarSign,
  },
]

function RouteComponent() {
  return (
    <div className='space-y-6 p-4 sm:p-6'>
      <section className='overflow-hidden rounded-2xl border bg-card'>
        <div className='bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.16),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(37,99,235,0.14),transparent_35%)] p-6 sm:p-8'>
          <Badge variant='secondary' className='mb-3'>
            Reporting Hub
          </Badge>
          <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
            Elegant Insights, Faster Decisions
          </h1>
          <p className='mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base'>
            Explore operational, inventory, logistics, and finance reports from one
            place. Use the focused report topics below to jump directly into the
            analysis you need.
          </p>
        </div>
      </section>

      <section>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Core Report Topics</h2>
          <span className='text-xs text-muted-foreground'>High impact views</span>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {headlineCards.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className='border-border/70 transition hover:shadow-md'>
                <CardHeader className='pb-2'>
                  <div className='mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background'>
                    <Icon className='h-4 w-4 text-primary' />
                  </div>
                  <CardTitle className='text-base'>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className='flex items-center justify-between pt-0'>
                  <Badge variant='outline'>{item.tag}</Badge>
                  <Link
                    to={item.to}
                    className='inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'
                  >
                    Open
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className='mb-3 text-lg font-semibold'>Financial Statements</h2>
        <Card className='border-border/70'>
          <CardContent className='grid gap-3 py-6 md:grid-cols-2'>
            {financeTopics.map((topic) => {
              const Icon = topic.icon
              return (
                <Link
                  key={topic.title}
                  to={topic.to}
                  className='group rounded-xl border bg-background p-4 transition hover:border-primary/40 hover:bg-accent/30'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <h3 className='text-sm font-semibold'>{topic.title}</h3>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {topic.description}
                      </p>
                    </div>
                    <Icon className='mt-0.5 h-4 w-4 text-muted-foreground transition group-hover:text-primary' />
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
