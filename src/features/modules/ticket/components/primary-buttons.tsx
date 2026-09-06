import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { useTicket } from '../contexts/ticket-context'

export function PrimaryButtons() {
  const { setOpen } = useTicket()
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>New Ticket</span>
        <IconPlus size={18} />
      </Button>
    </div>
  )
}
