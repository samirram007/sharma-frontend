import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { useMenu } from '../contexts/menu-context'

export function PrimaryButtons() {
  const { setOpen, setCurrentRow } = useMenu()
  return (
    <div className="flex gap-2">
      <Button
        variant="default"
        className="space-x-1"
        onClick={() => {
          setCurrentRow(null)
          setOpen('add')
        }}
      >
        <span>Add Menu Entry</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
