import { Button } from '@/components/ui/button'
import { IconUserPlus } from '@tabler/icons-react'
import { useGrade } from '../contexts/grade-context'


export function PrimaryButtons() {
  const { setOpen } = useGrade()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Grade</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
