import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { useQuery } from "@tanstack/react-query"

import { cn } from "@/lib/utils"
import { useFormContext, type UseFormReturn } from "react-hook-form"
import { fetchLedgerBalanceService, fetchStockInHandLedgersService } from "../../../data/api"
import type { DeliveryNoteForm } from "../../../data/schema"
import { TransactionLedgerCombobox } from './transaction-ledger-combo-box'
import VoucherDispatchDetail02 from "../voucher-dispatch-detail02"


interface TransactionLedgerFormProps {
    form: UseFormReturn<DeliveryNoteForm>
    tabIndex?: number
}


const TransactionLedgerForm = (props: TransactionLedgerFormProps) => {
    const { form } = props;
// const form = useFormContext<DeliveryNoteForm>()
    const { data: transactionLedgers, isLoading } = useQuery({
        queryKey: ["accountLedgers", "stock_in_hand"],
        queryFn: () => fetchStockInHandLedgersService(),
    })

    if (isLoading) {
        return <div>Loading...</div>
    }
    // console.log(tabIndex)
    return (
        <>
            <FormField
                control={form.control}
                name={'transactionLedger.id'}
                render={() => (
                    <FormItem className='grid grid-rows-1 gap-1 '>
                        <div className="grid grid-cols-[140px_1fr] justify-start items-center ">

                            <FormLabel className=' text-right'>
                                Stock Ledger
                            </FormLabel>
                            <div className={cn(form.getValues('transactionLedger.id') ? "w-8/12" : "w-10/12", "grid grid-cols-[auto_1fr_100px] gap-2 items-center  ")}>
                                <div className="text-right" >:</div>
                                <TransactionLedgerCombobox form={form} transactionLedgers={transactionLedgers?.data} />

                                {
                                    form.getValues('transactionLedger.id') &&

                                    <VoucherDispatchDetail02 form={form} />
                                }
                            </div>
                            <FormMessage className=' col-start-3' />
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

export default TransactionLedgerForm

const CurrentBalance = () => {
    const form = useFormContext<DeliveryNoteForm>()
    const { data: currentBalance, isLoading } = useQuery({
        queryKey: ["currentBalance", form.watch('transactionLedger.id')],
        queryFn: () => fetchLedgerBalanceService(form.watch('transactionLedger.id')!),
        enabled: !!form.watch('transactionLedger.id'),
    })
    if (isLoading) {
        return <div className="italic text-sm">Current Balance : Calculating...</div>
    }
    return (
        <div className="italic text-sm">Current Balance :
            {currentBalance?.data.balance.toFixed(2)} {currentBalance?.data.nature}</div>
    )
}