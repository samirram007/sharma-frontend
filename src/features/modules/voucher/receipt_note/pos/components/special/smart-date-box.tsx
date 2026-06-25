import FormInputField from "@/components/form-input-field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";


// type SmartDateBoxProps<T extends FieldValues> = {
//     form: UseFormReturn<T>;
//     name: keyof T;
// };

type SmartDateBoxProps<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: Path<T>;
};
export function SmartDateBox<T extends FieldValues>({
    form,
    name,
}: SmartDateBoxProps<T>) {

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const parsed = parseAndFormatDate(displayValue!);
            if (parsed) {
                const formatted = parsed.toLocaleDateString("en-GB").replace(/\//g, '-'); // DD/MM/YYYY
                setDisplayValue(formatted);
                const DBFormat = `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, '0')}-${parsed.getDate().toString().padStart(2, '0')}`
                form.setValue(name, DBFormat as any, { shouldValidate: true, shouldDirty: true });
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.value === '') {
            setDisplayValue("");
            form.setValue(name, null as any, { shouldValidate: true, shouldDirty: true });
            return;
        }
        setDisplayValue(e.target.value);

    };
    return (
        <>
            {/* {form.watch(name)} {displayValue} */}
            <Input
                type="text"
                placeholder="DD.MM or DD.MM.YYYY"
                value={displayValue!}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
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


export const ReceiptNoteForm = {
    DateBox: SmartDateBox,
};