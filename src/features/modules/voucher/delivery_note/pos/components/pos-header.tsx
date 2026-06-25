import FormInputField from "@/components/form-input-field";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { Label } from "recharts";
import PartyLedgerForm from "../../components/sub-component/party/party-ledger-form";
import TransactionLedgerForm from "../../components/sub-component/transaction/transaction-ledger-form";
import type { DeliveryNoteForm } from "../../data/schema";

type PosHeaderProps = {
    mainForm: UseFormReturn<DeliveryNoteForm>
}

const PosHeader = ({ mainForm: form }: PosHeaderProps) => {
// const form = useFormContext<DeliveryNoteForm>()


    const voucherDate = form.watch("voucherDate")

    const dayName = voucherDate
        ? new Date(voucherDate).toLocaleDateString("en-US", { weekday: "long" })
        : ""


    return (
        <div className="grid grid-rows-1   ">
            <div className="grid grid-cols-[350px_1fr_100px]   border-0">

                <div className="space-y-0">
                    <div className="grid grid-cols-[120px_200px] gap-2 ">
                        <div className="bg-green-600 text-gray-100 px-2 shadow-md  ">Delivery Note</div>
                        <div>no:
                            <span className=" uppercase font-bold text-lg text-teal-800 underline underline-offset-2 decoration-1 pl-2 space-r-1">
                                {form.getValues('voucherNo') ?? 'new'}
                            </span>
                        </div>
                    </div>
                    <div className="hidden grid-cols-[250px_300px] gap-6 pt-2">
                        <div className="grid grid-cols-[40px_200px]">
                            <FormInputField form={form} tabIndex={0}
                                gapClass={"grid grid-cols-[90px_150px] gap-4"} type="text" name="referenceNo" label="Reference No." />
                        </div>
                        <div className="grid grid-cols-[110px_150px]">
                            <Label>Reference Date:</Label>
                            <DateBox tabIndex={1}
                                form={form} name="referenceDate" />


                        </div>
                    </div>

                </div>
                <div></div>
                <div className="grid grid-rows-2 gap-0 justify-end items-start ">

                    <div>
                        <DateBox tabIndex={2} form={form} name="voucherDate" />

                        <div className="text-right text-sm font-bold">{dayName}</div>
                    </div>

                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pb-2">
                <div className="grid grid-rows-2 gap-2 items-center">
                    <PartyLedgerForm tabIndex={3} />
                    <TransactionLedgerForm tabIndex={4} form={form} />

                </div>
                <div className="sm:hidden grid grid-cols-2 gap-2 items-center">
                    <pre>
                        {JSON.stringify(form.getValues('party'), null, 2)}
                    </pre>
                    <div className="text-right">Cost Center: </div><Input type="text" />
                </div>
            </div>
        </div>
    )
}

export default PosHeader




type DateBoxProps = {
    form: UseFormReturn<DeliveryNoteForm>,
    name: keyof DeliveryNoteForm
    tabIndex?: number
}

const DateBox = (props: DateBoxProps) => {
    const { form, name, } = props;
    const [displayValue, setDisplayValue] = useState<string | null>("");

    const parseAndFormatDate = (input: string): Date | null => {
        if (!input) return null;

        const now = new Date();
        const parts = input.split(/[./-]/).map(p => p.trim());

        let day = Number(parts[0]);
        let month = parts[1] ? Number(parts[1]) - 1 : now.getMonth(); // month index
        let year =
            parts[2] && parts[2].length === 2
                ? 2000 + Number(parts[2])
                : parts[2]
                    ? Number(parts[2])
                    : now.getFullYear();

        if (isNaN(day) || day < 1 || day > 31) return null;
        if (isNaN(month) || month < 0 || month > 11) return null;
        if (isNaN(year) || year < 1000) return null;

        return new Date(year, month, day);
    };
    const parseDate = () => {
        const parsed = parseAndFormatDate(displayValue!);
        if (parsed) {
            form.setValue(name, parsed, { shouldValidate: true, shouldDirty: true });
            const formatted = parsed.toLocaleDateString("en-GB").replace(/\//g, '-'); // DD/MM/YYYY
            setDisplayValue(formatted);
            const DBFormat = `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, '0')}-${parsed.getDate().toString().padStart(2, '0')}`
            form.setValue(name, DBFormat, { shouldValidate: true, shouldDirty: true });
        }
    }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            parseDate();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.value === '') {
            setDisplayValue("");
            form.setValue(name, null, { shouldValidate: true, shouldDirty: true });
            return;
        }
        setDisplayValue(e.target.value);

    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.preventDefault();

        parseDate();
        // if (parsed) {
        //     form.setValue(name, parsed, { shouldValidate: true, shouldDirty: true });
        //     const formatted = parsed.toLocaleDateString("en-GB").replace(/\//g, '-'); // DD/MM/YYYY
        //     setDisplayValue(formatted);
        //     const DBFormat = `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, '0')}-${parsed.getDate().toString().padStart(2, '0')}`
        //     form.setValue(name, DBFormat, { shouldValidate: true, shouldDirty: true });
        // }
    };



    useEffect(() => {
        const formValue = form.watch(name);
        if (formValue) {
            let parsed: Date;

            if (typeof formValue === "string" || typeof formValue === "number") {
                parsed = new Date(formValue);
            } else if (formValue instanceof Date) {
                parsed = formValue;
            } else {
                return; // not a valid date type
            }

            if (!isNaN(parsed.getTime())) {
                const formatted = parsed.toLocaleDateString("en-GB").replace(/\//g, "-");
                setDisplayValue(formatted);
            }
        } else {
            setDisplayValue("");
        }
        parseDate();
    }, [form.watch(name)]);


    return (
        <>
            {/* {form.watch(name)} {displayValue} */}
            <Input
                type="text"
                placeholder="__-__-____"
                value={displayValue!}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                autoFocus={true}
            />
            <span className="hidden">

                <FormInputField type='date' form={form}
                    label=''
                    noLabel
                    gapClass="grid-cols-[1fr] gap-0  "
                    name={name} />
            </span>
        </>
    )
}