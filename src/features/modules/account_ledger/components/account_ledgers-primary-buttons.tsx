import { Button } from '@/components/ui/button'

import { IconUserPlus } from '@tabler/icons-react'
import { useAccountLedger } from '../contexts/account-ledger-context'


export function AccountLedgersPrimaryButtons() {
  const { setOpen } = useAccountLedger()
  return (
    <div className='flex gap-2'>
      {/* <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('invite')}
      >
        <span>Invite User</span> <IconMailPlus size={18} />
      </Button> */}
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Account Ledger</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
