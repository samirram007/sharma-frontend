import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { useStatus } from '../contexts/status-context'

export function PrimaryButtons() {
  const { setOpen } = useStatus()
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>Add Status</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
