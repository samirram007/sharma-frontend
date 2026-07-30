import { Card, CardContent } from '@/components/ui/card'
import { Shield, ShieldCheck, ShieldX, ShieldQuestion } from 'lucide-react'

interface StatsCardsProps {
  totalFeatures: number
  granted: number
  denied: number
  notSet: number
}

export function PermissionStatsCards({ totalFeatures, granted, denied, notSet }: StatsCardsProps) {
  const grantPct = totalFeatures > 0 ? Math.round((granted / totalFeatures) * 100) : 0

  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
      <StatCard
        icon={<Shield className='h-5 w-5 text-blue-500' />}
        label='Total Features'
        value={totalFeatures}
        bg='bg-blue-50 dark:bg-blue-950/30'
        iconBg='bg-blue-100 dark:bg-blue-900/50'
      />
      <StatCard
        icon={<ShieldCheck className='h-5 w-5 text-emerald-500' />}
        label='Granted'
        value={granted}
        sub={`${grantPct}%`}
        bg='bg-emerald-50 dark:bg-emerald-950/30'
        iconBg='bg-emerald-100 dark:bg-emerald-900/50'
      />
      <StatCard
        icon={<ShieldX className='h-5 w-5 text-red-500' />}
        label='Denied'
        value={denied}
        bg='bg-red-50 dark:bg-red-950/30'
        iconBg='bg-red-100 dark:bg-red-900/50'
      />
      <StatCard
        icon={<ShieldQuestion className='h-5 w-5 text-amber-500' />}
        label='Not Set'
        value={notSet}
        bg='bg-amber-50 dark:bg-amber-950/30'
        iconBg='bg-amber-100 dark:bg-amber-900/50'
      />
    </div>
  )
}

function StatCard({ icon, label, value, sub, bg, iconBg }: {
  icon: React.ReactNode
  label: string
  value: number
  sub?: string
  bg: string
  iconBg: string
}) {
  return (
    <Card className={`border-0 shadow-sm ${bg} transition-all hover:shadow-md`}>
      <CardContent className='flex items-center gap-3 p-4'>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div className='min-w-0'>
          <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>{label}</p>
          <div className='flex items-baseline gap-1.5'>
            <p className='text-2xl font-bold tracking-tight text-foreground'>{value}</p>
            {sub && <span className='text-xs font-medium text-muted-foreground'>{sub}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
