import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useReceiptNoteMutation } from "../../../data/queryOptions";
import { Button } from "@/components/ui/button";
import type { UseFormReturn } from "react-hook-form";
import type { ReceiptNoteForm } from "../../../data/schema";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { StockJournalEntryForm, StockJournalGodownEntryForm } from "@/features/modules/voucher/data-schema/voucher-schema";
import { Route as ReceiptNoteRoute } from "@/routes/_protected/transactions/_provider/vouchers/_layout/receipt_note/_layout/$id";


type SaveDialogProps = {
    mainForm: UseFormReturn<ReceiptNoteForm>
    isSaving: boolean;
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

const UpdateDialog = ({ mainForm, isSaving, setSaving }: SaveDialogProps) => {
    console.log("HELLO SAVING")
    const { mutate: createReceiptNote, isPending } = useReceiptNoteMutation();
    const { id } = ReceiptNoteRoute.useParams();
    const [errors, setErrors] = useState<string[]>([]);
    const [checking, setChecking] = useState(true);
    const [valid, setValid] = useState(false);  // for success animation
    const handleSaving = () => {
        console.log('Form submitted', mainForm.getValues(), id);

        if (mainForm.getValues('isEdit') && id) {
            createReceiptNote({ ...mainForm.getValues(), id: Number(id) });
            return;
        }
        else {
            // Create new receipt note
            createReceiptNote(mainForm.getValues());
            return;
        }

    }

    useEffect(() => {
        let timer: any = null;

        // Start checking animation
        setChecking(true);
        setValid(false);

        timer = setTimeout(() => {
            const data = mainForm.getValues();
            const newErrors: string[] = [];

            // --- BASIC VALIDATIONS ---
            const partyLedgerId = data.partyLedger?.id;
            const transactionLedgerId = data.transactionLedger?.id;

            if (!partyLedgerId) newErrors.push("Party Ledger is required.");
            if (!transactionLedgerId) newErrors.push("Stock Ledger is required.");

            const stockJournalEntries: StockJournalEntryForm[] =
                ((data.stockJournal?.stockJournalEntries || []).filter(Boolean) as StockJournalEntryForm[]);

            if (stockJournalEntries.length === 0) {
                newErrors.push("Please add at least one stock item entry.");
            }

            // --- Duplicate stock item check ---
            const stockItemIds = stockJournalEntries.map(e => e.stockItemId);
            const unique = new Set(stockItemIds);
            if (unique.size !== stockItemIds.length) {
                newErrors.push("Duplicate stock items detected — each stock item must be unique.");
            }
            console.log("STOCK JOURNAL ENTRIES:", stockJournalEntries);
            // --- Combined Entry + Godown validations ---
            stockJournalEntries.forEach((stockJournalEntry, entryIndex) => {
                if (!stockJournalEntry.stockItemId) {
                    newErrors.push(`Entry #${entryIndex + 1}: Stock item is required.`);
                }
                if (!stockJournalEntry.amount || stockJournalEntry.amount <= 0) {
                    newErrors.push(`Entry #${entryIndex + 1}: Amount must be greater than 0.`);
                }

                const stockJournalGodownEntries = (stockJournalEntry.stockJournalGodownEntries || []).filter(Boolean);
                if (stockJournalGodownEntries.length === 0) {
                    newErrors.push(`Entry #${entryIndex + 1}: At least one godown entry is required.`);
                }

                // Duplicate godownId + batchNo pairs
                const combos = stockJournalGodownEntries.filter((g): g is StockJournalGodownEntryForm => Boolean(g)).map(g => `${g.godownId}-${g.batchNo || ''}`);
                const comboUnique = new Set(combos);
                if (comboUnique.size !== combos.length) {
                    newErrors.push(
                        `Entry #${entryIndex + 1}: Duplicate godown + batch combinations found.`
                    );
                }

                stockJournalGodownEntries.forEach((g, gIndex) => {
                    if (!g) return;
                    if (!g.godownId) {
                        newErrors.push(`Entry #${entryIndex + 1}, Godown #${gIndex + 1}: Select a godown.`);
                    }
                    if (!g.billingQuantity || g.billingQuantity <= 0) {
                        newErrors.push(`Entry #${entryIndex + 1}, Godown #${gIndex + 1}: Billing qty must be > 0.`);
                    }
                    if (!g.amount || g.amount <= 0) {
                        newErrors.push(`Entry #${entryIndex + 1}, Godown #${gIndex + 1}: Amount must be > 0.`);
                    }
                });
            });

            // UPDATE STATE
            setErrors(newErrors);
            setChecking(false);
            setValid(newErrors.length === 0);

            // success animation resets after 1 sec
            // if (newErrors.length === 0) {
            //     setTimeout(() => setValid(false), 1000);
            // }

        }, 2000); // 👈 small delay for UX + animation

        return () => clearTimeout(timer);
    }, [isPending, setSaving]);


    return <div>
        <Dialog open={isSaving}
            onOpenChange={(state) => {

                setSaving(state)
            }} >
            <DialogTrigger asChild>
                <Button type="button"
                    variant="default"
                    className="h-8 w-full focus:bg-black focus:text-white"
                    size="lg"
                    disabled={isSaving}><Loader className="animate-spin" /> Saving...</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-5xl'>
                <DialogHeader className='text-left border-b-2 pb-2'>
                    <DialogTitle>Delivery Note </DialogTitle>
                    <DialogDescription>
                        Please wait while we are saving the delivery note.
                    </DialogDescription>
                </DialogHeader>
                <div className='-mr-4 h-full w-full  overflow-y-auto py-1 pr-4'>
                    {checking && (
                        <div className="text-blue-500 animate-pulse">
                            Validating...
                        </div>
                    )}

                    {valid && (
                        <div className="text-green-600 font-semibold animate-bounce">
                            ✔ All checks passed!
                        </div>
                    )}

                    {errors.length > 0 && (
                        <ul className="text-red-500 space-y-1 mt-2">
                            {errors.map((err, i) => (
                                <li key={i} className="flex gap-2">
                                    • <span>{err}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleSaving}
                        disabled={isPending || errors.length > 0 || checking || !valid}
                        className="h-8 focus:bg-black focus:text-white"  >
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >

    </div>
}
export default UpdateDialog;