
import LongText from '@/components/long-text'
import type { AccountLedger } from '@/features/modules/account_ledger/data/schema'
import type { Row } from '@tanstack/react-table'
import { useAccountLedger } from '../contexts/account-ledger-context'


interface AccountLedgerViewProps {
  row: Row<AccountLedger>
}

export function AccountLedgerView({ row }: AccountLedgerViewProps) {
  const { setOpen, setCurrentRow } = useAccountLedger()
  return (
    <>
      <div onClick={() => {
        setCurrentRow(row.original)
        setOpen('edit')
      }}>

        <LongText className='max-w-64 hover:cursor-pointer hover:underline' >{row.getValue('name')}</LongText>
      </div>

    </>
  )
}
