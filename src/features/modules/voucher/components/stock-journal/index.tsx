

import FormInputField from "@/components/form-input-field";
import { useFieldArray, type UseFormReturn } from "react-hook-form";

import { useTransaction } from "@/features/transactions/context/transaction-context";
import { useEffect } from "react";
import { stockJournalEntryDefaultValues } from '../../receipt_note/data/data';


import { PosJournalEntryItemProvider, usePosJournalEntryItem } from "../../contexts/pos-journal-entry-item-context";
import { StockJournalEntry } from "./entry-test";
import type { StockJournalEntryForm, StockJournalForm } from "../../data-schema/voucher-schema";
import { usePos } from "../../contexts/pos-context";

type StockJournalProps = {
    stockJournalForm: UseFormReturn<StockJournalForm>;
};

const StockJournal = ({ stockJournalForm }: StockJournalProps) => {
    const { config } = useTransaction()
    // const stockJournalForm = useFormContext<StockJournalForm>();

    return (
        <div>
            <div className="hidden grid-cols-3 gap-8 ">

                <FormInputField type="text" form={stockJournalForm} name="journalNo" />
                <FormInputField type="date" form={stockJournalForm} name="journalDate" />
                <FormInputField type="text" form={stockJournalForm} name="type" />
            </div>
            <div className="border-inside-all 
                    grid grid-rows-1 grid-cols-[1fr_300px_150px_80px_80px_200px_120px] 
                    bg-gray-300 text-center border-border">

                <div className="border-r-0!  ">Particulars</div>


                {config.find(c => c.key === 'show_actual_and_billing_quantity')?.value ? (
                    <div className="grid grid-rows-2 border-0!">
                        <div className="border-b-0!  ">Quantity</div>
                        <div className="grid grid-cols-2 items-center">
                            <div className="border-y-0! border-x-0!  ">Actual</div>
                            <div className="border-y-0! border-r-0!  ">Billing</div>
                        </div>
                        <div className="grid grid-cols-2 items-center"></div>
                    </div>
                ) :
                    <div>Quantity</div>
                }
                <div className="border-l-0!">Rate</div>
                <div className="border-l-0!">per</div>
                <div className="border-l-0!">disc%</div>
                <div className="border-l-0!">Amount</div>
                <div className="border-l-0!">Action</div>

            </div>
            <PosJournalEntryItemProvider>
                <StockJournalEntriesSection stockJournalForm={stockJournalForm} />
            </PosJournalEntryItemProvider>
        </div>
    )
}

export default StockJournal


const StockJournalEntriesSection = ({ stockJournalForm }: StockJournalProps) => {
    // const stockJournalForm = useFormContext<StockJournalForm>();

    const { movementType } = usePos()
    const { addItemEntryButtonRef, addItemButtonVisible, setAddItemButtonVisible } = usePosJournalEntryItem();


    const stockJournalEntryButtonStyles = "bg-blue-500 focus:bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded";

    const { fields, append, remove } = useFieldArray({
        control: stockJournalForm.control,
        name: "stockJournalEntries",

    });
    const handleOnClickAddEntry = () => {
        // const lastEntry = fields[fields.length - 1];
        // console.log('lastEntry: ', stockJournalForm.getValues('stockJournalEntries'), fields, lastEntry)
        const entries = stockJournalForm.getValues('stockJournalEntries') ;


        const hasZeroValue = entries.some((entry: any) => Number(entry.amount) === 0);
        // console.log("hasZeroValue: ", hasZeroValue)
        if (hasZeroValue) {
            stockJournalForm.setFocus(`stockJournalEntries.${fields.length - 1}.stockItem`);
            return;
        }

        append({ ...stockJournalEntryDefaultValues, movementType } as StockJournalEntryForm);

        setAddItemButtonVisible?.(false);

    }

    useEffect(() => {
        if (fields.length === 0) {
            handleOnClickAddEntry();
        }
    }, [])

    return (
        <div className="">
            {/* {fields?.length} */}
            {fields.map((field, index) => (
                <div key={field.id} className="w-full flex  items-center gap-4 border-b pb-2">
                    <StockJournalEntry
                        key={field.id}
                        index={index}
                        fieldsLength={fields.length}
                        remove={remove}
                        handleOnClickItemAddEntry={handleOnClickAddEntry}
                        stockJournalForm={stockJournalForm}

                    />

                </div>
            ))}
            {
                (addItemButtonVisible || fields.length === 0) &&
                <button type="button" ref={addItemEntryButtonRef}
                    className={stockJournalEntryButtonStyles}
                    onClick={handleOnClickAddEntry}>
                    + Add Item
                </button>
            }
        </div>
    );
};

