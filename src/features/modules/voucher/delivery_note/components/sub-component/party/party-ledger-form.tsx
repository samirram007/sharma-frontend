import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useQuery } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'
import { fetchPartyLedgerService } from '../../../../data-schema/partyLedger/data/api'
import { fetchLedgerBalanceService } from '../../../data/api'
import type { DeliveryNoteForm } from '../../../data/schema'
import PartyDetails from '../party-details'
import { PartyLedgerCombobox } from './party-ledger-combo-box'
import { PrimaryButtons as CreateDistributorButton } from '@/features/modules/distributor/components/primary-buttons'
import type { AccountLedger } from '@/features/modules/account_ledger/data/schema'

type FormProps = {
  tabIndex?: number
}
const PartyLedgerForm = (props: FormProps) => {
  const { tabIndex } = props as FormProps
  const form = useFormContext<DeliveryNoteForm>()
  const { data: partyLedgers, isLoading } = useQuery({
    queryKey: ['accountLedgers', 'distributor_ledgers'],
    queryFn: () => fetchPartyLedgerService('distributor_ledgers'),
  })
  const filteredPartyLedgers = partyLedgers?.data.filter(
    (ledger: AccountLedger) => ledger.ledgerableType === 'distributor',
  )
  if (isLoading) {
    return <div>Loading...</div>
  }
  // console.log("PARTY... :", form.watch('party'))
  return (
    <>
      <FormField
        control={form.control}
        name={'partyLedger.id'}
        render={() => (
          <FormItem className="grid grid-rows-1 gap-1 ">
            <div className="grid grid-cols-[140px_1fr] justify-start items-center ">
              <FormLabel htmlFor="" className=" text-right">
                Party's A/c Name
              </FormLabel>
              <div
                className={cn(
                  form.getValues('partyLedger.id') ? 'w-8/12' : 'w-10/12',
                  'grid grid-cols-[auto_1fr_auto_100px] gap-2 items-center  ',
                )}
              >
                <div className="text-right">:</div>
                <PartyLedgerCombobox
                  partyLedgers={filteredPartyLedgers}
                  tabIndex={tabIndex}
                />
                <CreateDistributorButton type="icon" isModal={true} />
                {form.getValues('partyLedger.id') && <PartyDetails />}
              </div>

              <FormMessage className=" col-start-3" />
            </div>
            <div className="grid grid-cols-[160px_1fr] items-center justify-start ">
              <div></div>
              <CurrentBalance />
            </div>
          </FormItem>
        )}
      />
    </>
  )
}

export default PartyLedgerForm

const CurrentBalance = () => {
  const form = useFormContext<DeliveryNoteForm>()
  const ledgerId = form.watch('partyLedger.id')
  const {
    data: currentBalance,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['currentBalance', ledgerId],
    queryFn: () => fetchLedgerBalanceService(ledgerId!),
    enabled: !!ledgerId,
  })
  if (isLoading) {
    return (
      <div className="italic text-sm">Current Balance : Calculating...</div>
    )
  }
  const balance = currentBalance?.data?.balance
  if (isError || balance === undefined || balance === null) {
    return (
      <div className="italic text-sm text-muted-foreground">
        Current Balance : —
      </div>
    )
  }

  return (
    <div className="italic text-sm">
      Current Balance :{Number(balance).toFixed(2)}{' '}
      {currentBalance?.data?.nature}
    </div>
  )
}
