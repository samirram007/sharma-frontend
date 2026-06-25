import FormInputField from "@/components/form-input-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/contexts/AuthContext";

import { date_format } from "@/utils/removeEmptyStrings";
import { zodResolver } from "@hookform/resolvers/zod";


import { useEffect, useState } from "react";
import { useForm, type Resolver, type UseFormReturn } from "react-hook-form";

import { formSchemaReportingPeriod, type ReportingPeriodForm } from "../../data/schema";
import { useReportingPeriodMutation } from "../../data/queryOptions";
import { toast } from "sonner";




const ReportingPeriod = () => {
    const [open, setOpen] = useState<boolean>(false);
    return (
        <>

            <PeriodDetailsDialog open={open} setopen={setOpen} />
        </>
    )
}

export default ReportingPeriod

const Period = ({ setopen }: { setopen: (value: boolean) => void }) => {
    const { period } = useAuth();

    return (
        <Button variant={'outline'} onClick={() => setopen(true)} className="cursor-pointer underline"      >

            {period ? `Period: ${date_format(period.startDate!)} to ${date_format(period.endDate!)}` : ''}
        </Button>
    )
}


export const PeriodDetailsDialog = ({ open, setopen }: { open: boolean, setopen: (value: boolean) => void }) => {
    const { period, fetchProfile } = useAuth();
    const { mutate: saveReportingPeriod, isPending } = useReportingPeriodMutation();

    const form = useForm<ReportingPeriodForm>({
        resolver: zodResolver(formSchemaReportingPeriod) as Resolver<ReportingPeriodForm>,
        defaultValues: {
            startDate: period?.startDate!,
            endDate: period?.endDate!,
        },
    })
    const handleSubmit = () => {
        form.handleSubmit((data) => {
            if (data.startDate && typeof data.startDate === 'string') {
                data.startDate = new Date(data.startDate);
            }
            if (data.endDate && typeof data.endDate === 'string') {
                data.endDate = new Date(data.endDate);
            }
            if (data.startDate && data.endDate && data.startDate > data.endDate) {
                toast.error("Start date cannot be after end date");
                return;
            }

            saveReportingPeriod({ ...data },
                {
                    onSuccess: () => {
                        toast.success("Reporting period updated successfully");
                        fetchProfile();
                        setopen(false);
                    },
                    onError: () => {
                        toast.error("Failed to update reporting period");
                        setopen(false);
                    },
                });
        })();



    }
    return (
        <Dialog
            open={open}
            onOpenChange={() => setopen(false)}
        >
            <DialogTrigger asChild>
                <Period setopen={setopen} />
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Period </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Form  {...form}>


                        {period ? (
                            <div className="space-y-2 grid grid-cols-2 gap-4">
                                <p><strong>Start Date:</strong><DateBox form={form} autoFocus={true} name={'startDate'} /></p>
                                <p><strong>End Date:</strong><DateBox form={form} name={'endDate'} /></p>

                            </div>
                        ) : (
                            <p>No accounting period set.</p>
                        )}
                    </Form>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isPending} variant="outline">Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

type DateBoxProps = {
    form: UseFormReturn<ReportingPeriodForm>;
    autoFocus?: boolean;
    name: keyof ReportingPeriodForm;
}

const DateBox = (props: DateBoxProps) => {
    const { form, name, autoFocus } = props;
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
            console.log("Par DAted", parsed)
            const DBFormat = `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, '0')}-${parsed.getDate().toString().padStart(2, '0')}`
            form.setValue(name, DBFormat as unknown as Date, { shouldValidate: true, shouldDirty: true });
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
                autoFocus={autoFocus}
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