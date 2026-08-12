import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartCardProps {
  title: string
  description: string
  loading: boolean
  error: boolean
  onRetry: () => void
  children: ReactNode
}

/**
 * Dashboard widget wrapper. Each widget owns its own loading / error states so a
 * single failed widget query renders an inline fallback instead of taking down
 * the whole dashboard.
 */
export function ChartCard({
  title,
  description,
  loading,
  error,
  onRetry,
  children,
}: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : error ? (
          <div className="flex h-[240px] flex-col items-center justify-center gap-3 rounded-md border border-dashed px-4 text-center">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Couldn't load this chart.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
