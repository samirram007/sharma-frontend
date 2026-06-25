import { Skeleton } from '@/components/ui/skeleton'

function SkeletonAvatar() {
  return (
    <div className="flex w-fit items-center gap-4">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function SkeletonCard() {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
    </Card>
  )
}

function SkeletonText() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

export function SkeletonButton() {
  return <Skeleton className="h-8 w-16" />
}

function SkeletonForm() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-7">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  )
}

function SkeletonTable({
  className,
  colCount,
  rowCount,
}: {
  className?: string
  colCount?: number
  rowCount?: number
}) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {Array.from({ length: rowCount || 5 }).map((_, index) => (
        <div className="flex gap-4" key={index}>
          {Array.from({ length: colCount || 3 }).map((_, colIndex) => (
            <Skeleton className="h-4 flex-1" key={colIndex} />
          ))}
        </div>
      ))}
    </div>
  )
}

export { SkeletonAvatar, SkeletonText, SkeletonForm, SkeletonTable }
