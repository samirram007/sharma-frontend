import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { useFaq } from '../contexts/faq-context'

export function PrimaryButtons() {
  const { setOpen } = useFaq()
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen('add')}>
        <span>Add FAQ</span>
        <IconPlus size={18} />
      </Button>
    </div>
  )
}
