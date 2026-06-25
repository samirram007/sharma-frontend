import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { useQuery } from "@tanstack/react-query"

import type { UseFormReturn } from "react-hook-form"
import { fetchPartyLedgerService } from "../../../data-schema/partyLedger/data/api"
import type { ReceiptNoteForm } from "../../data/schema"
import { PartyLedgerCombobox } from "../sub-component/party/party-ledger-combo-box"




type FormProps = {
    form: UseFormReturn<ReceiptNoteForm>;
};
const PartyLedgerForm = (props: FormProps) => {
    const { form } = props as FormProps;
    const { data: partyLedgers, isLoading } = useQuery({
        queryKey: ["accountLedgers", "supplier_ledgers"],
        queryFn: () => fetchPartyLedgerService('supplier_ledgers'),
    })


    // const handleValueChange = (value: string) => {
    //     form.setValue('party.id', Number(value))

    // }
    if (isLoading) {
        return <div>Loading...</div>
    }
    return (
        <>
            <FormField
                control={form.control}
                name={'party.id'}
                render={() => (
                    <FormItem className='grid grid-rows-1 gap-1 '>
                        <div className="grid grid-cols-[140px_1fr] justify-start items-center ">

                            <FormLabel className=' text-right'>
                                Party's A/c Name
                            </FormLabel>
                            <div className="w-8/12 grid grid-cols-[auto_1fr] gap-2 items-center  ">
                                <div className="text-right" >:</div>
                                <PartyLedgerCombobox partyLedgers={partyLedgers?.data} />

                            </div>
                            <FormMessage className=' col-start-3' />
                        </div>
                        <div className="grid grid-cols-[160px_1fr] items-center justify-start ">
                            <div></div>
                            <div className="italic text-sm">Current Balance : 50000 cr</div>
                        </div>
                    </FormItem>
                )}
            />
        </>

    )
}

export default PartyLedgerForm