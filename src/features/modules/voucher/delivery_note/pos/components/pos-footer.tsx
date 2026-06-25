import { Button } from '@/components/ui/button';
import { useFocusArea } from '@/core/hooks/useFocusArea';
import { useEffect, useRef, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';

import type { DeliveryNoteForm } from '../../data/schema';
import NarrationBox from './special/narration-box';
import SaveDialog from './special/save-dialog';

type PosFooterProps = {
    mainForm: UseFormReturn<DeliveryNoteForm>
}


const PosFooter = ({ mainForm }: PosFooterProps) => {
// const mainForm = useFormContext<DeliveryNoteForm>();

    const footerRef = useRef<HTMLDivElement>(null);
    const [isSaving, setSaving] = useState<boolean>(false);

    useFocusArea(footerRef as React.RefObject<HTMLElement>);
    // useRestrictFocusToRef(footerRef as React.RefObject<HTMLElement>);
    const { watch } = mainForm;
    const total = watch("stockJournal.stockJournalEntries")?.reduce((acc, entry) => acc + (entry?.amount || 0), 0) || 0;
    useEffect(() => {
        const voucherEntries = mainForm.getValues("voucherEntries") || [];

        const transactionLedgerId = mainForm.getValues("transactionLedger.id");
        const partyLedgerId = mainForm.getValues("partyLedger.id");

        if (!transactionLedgerId || !partyLedgerId) return;

        let updated = [...voucherEntries];

        // --- STEP 1: ensure transaction entry exists ---
        let transactionEntry = updated.find(
            (e) => e && e.accountLedgerId === transactionLedgerId
        );

        if (!transactionEntry) {
            transactionEntry = {
                id: undefined,
                voucherId: undefined,
                accountLedgerId: transactionLedgerId,
                debit: 0,
                credit: 0,
                remarks: "",
                entryOrder: updated.length + 1,
            };
            updated.push(transactionEntry);
        }

        // --- STEP 2: ensure party entry exists ---
        let partyEntry = updated.find(
            (e) => e && e.accountLedgerId === partyLedgerId
        );

        if (!partyEntry) {
            partyEntry = {
                id: undefined,
                voucherId: undefined,
                accountLedgerId: partyLedgerId,
                debit: 0,
                credit: 0,
                remarks: "",
                entryOrder: updated.length + 1,
            };
            updated.push(partyEntry);
        }

        // --- STEP 3: update debit/credit values ---
        updated = updated.filter((entry) => entry !== null && entry !== undefined).map((entry, idx) => {
            // ensure entryOrder is always correct
            const entryOrder = idx + 1;

            if (entry.accountLedgerId === transactionLedgerId) {
                return {
                    ...entry,
                    accountLedgerId: transactionLedgerId,
                    debit: 0,
                    credit: total,
                    entryOrder,
                };
            }
            if (entry.accountLedgerId === partyLedgerId) {
                return {
                    ...entry,
                    accountLedgerId: partyLedgerId,
                    debit: total,
                    credit: 0,
                    entryOrder,
                };
            }
            return { ...entry, accountLedgerId: entry.accountLedgerId!, entryOrder };
        });

        mainForm.setValue("voucherEntries", updated, {
            shouldValidate: false,
            shouldDirty: true,
        });

    }, [total]);



    return (
        <div ref={footerRef} className="bg-green-600/20 grid grid-cols-[1fr_1fr] px-8">
            <div className="grid ">
                {/* <Button autoFocus={true} variant="outline" className="w-full h-20 text-left"

                    type="button" asChild  > 
                        </Button>*/}
                <NarrationBox type="textarea"
                    form={mainForm}
                    isSaving={isSaving}
                    setSaving={setSaving}
                    gapClass={''} className="text-gray-200 " name="remarks" />



            </div>
            <div className="grid grid-rows-[1fr_1fr]  items-start  justify-end">
                <div className='grid grid-cols-[1fr_140px] pt-2'>
                    <div className="text-right font-bold  ">
                    Total: {total ? Number(total).toFixed(2) : 0}
                </div>
                    <div></div>
                </div>

                <div className="text-left pl-2">
                    {isSaving ?
                        <SaveDialog mainForm={mainForm} isSaving={isSaving} setSaving={setSaving} />
                        : 
                    <Button
                            type="button"
                            variant="default"
                        className="h-8 w-full focus:bg-black focus:text-white"
                        size="lg"
                            disabled={isSaving}
                            onClick={() => setSaving(true)}>Save....</Button>
                    }

                </div>
            </div>

        </div>


    )
}

export default PosFooter