import FormInputField from "@/components/form-input-field";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/features/auth/contexts/AuthContext";

import { date_format } from "@/utils/removeEmptyStrings";
import { startOfDay } from "@/utils/date";
import { zodResolver } from "@hookform/resolvers/zod";


import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, type Resolver, type UseFormReturn } from "react-hook-form";

import { formSchemaReportingPeriod, type ReportingPeriodForm } from "../../data/schema";
import { useReportingPeriodMutation } from "../../data/queryOptions";
import { toast } from "sonner";




const ReportingPeriod = ({ hideTrigger, disableHotkey }: { hideTrigger?: boolean, disableHotkey?: boolean }) => {
    const [open, setOpen] = useState<boolean>(false);

    // Global hotkey: Alt+P to open the period modal — only one instance should register this
    useEffect(() => {
        if (disableHotkey) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Alt+P or Ctrl+Shift+P — skip when typing in inputs
            const isModifier = (e.altKey || (e.ctrlKey && e.shiftKey)) && (e.key === 'p' || e.key === 'P')
            if (!isModifier) return

            const activeTag = document.activeElement?.tagName?.toLowerCase()
            if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) return

            e.preventDefault()
            setOpen(prev => !prev)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [disableHotkey])

    return (
        <>
            <PeriodDetailsDialog open={open} setopen={setOpen} hideTrigger={hideTrigger} />
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


export const PeriodDetailsDialog = ({ open, setopen, hideTrigger }: { open: boolean, setopen: (value: boolean) => void, hideTrigger?: boolean }) => {
    const { period, fetchProfile } = useAuth();
    const { mutate: saveReportingPeriod, isPending } = useReportingPeriodMutation();
    const confirmRef = useRef<HTMLButtonElement>(null);

    const form = useForm<ReportingPeriodForm>({
        resolver: zodResolver(formSchemaReportingPeriod) as Resolver<ReportingPeriodForm>,
        defaultValues: {
            startDate: period?.startDate!,
            endDate: period?.endDate!,
        },
    })

    const focusNextInput = () => {
        // Focus the end date input within the dialog
        const inputs = document.querySelectorAll('[role="dialog"] input[type="text"]');
        if (inputs.length > 1) {
            (inputs[1] as HTMLInputElement).focus();
        }
    };

    const submitForm = () => {
        confirmRef.current?.click();
    };

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
            {!hideTrigger && (
                <DialogTrigger asChild>
                    <Period setopen={setopen} />
                </DialogTrigger>
            )}
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Period </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Form  {...form}>


                        {period ? (
                            <div className="space-y-2 grid grid-cols-2 gap-4">
                                <p><strong>Start Date:</strong><DateBox form={form} autoFocus={true} name={'startDate'} onEnterNext={focusNextInput} /></p>
                                <p><strong>End Date:</strong><DateBox form={form} name={'endDate'} onEnterNext={submitForm} /></p>

                            </div>
                        ) : (
                            <p>No accounting period set.</p>
                        )}
                    </Form>
                </div>
                <DialogFooter>
                    <Button ref={confirmRef} onClick={handleSubmit} disabled={isPending} variant="outline">Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

type DateBoxProps = {
    form: UseFormReturn<ReportingPeriodForm>;
    autoFocus?: boolean;
    name: 'startDate' | 'endDate';
    onEnterNext?: () => void;
}

const DateBox = (props: DateBoxProps) => {
    const { form, name, autoFocus, onEnterNext } = props;
    const { userFiscalYear } = useAuth();
    const [displayValue, setDisplayValue] = useState<string | null>("");
    const [calendarOpen, setCalendarOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const fiscalYearStart = userFiscalYear?.fiscalYear?.startDate ?? null;
    const fiscalYearEnd = userFiscalYear?.fiscalYear?.endDate ?? null;
    const fyStart = fiscalYearStart ? new Date(fiscalYearStart) : null;
    const fyEnd = fiscalYearEnd ? new Date(fiscalYearEnd) : null;

    const validateFiscalYear = (date: Date): boolean => {
        if (!fyStart || !fyEnd) return true;
        // Normalize to start of day for comparison
        if (startOfDay(date) < startOfDay(fyStart) || startOfDay(date) > startOfDay(fyEnd)) {
            toast.error(`Date must be within fiscal year (${date_format(fyStart)} to ${date_format(fyEnd)})`);
            return false;
        }
        return true;
    };

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

        // document.write(year);
        if (isNaN(day) || day < 1 || day > 31) return null;
        if (isNaN(month) || month < 0 || month > 11) return null;
        if (isNaN(year) || year < 1000) return null;

        return new Date(year, month, day);
    };

    const applyDate = (date: Date) => {
        if (!validateFiscalYear(date)) return;
        const formatted = format(date, 'dd-MM-yyyy');
        setDisplayValue(formatted);
        const DBFormat = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        form.setValue(name, DBFormat as unknown as Date, { shouldValidate: true, shouldDirty: true });
    };

    const parseDate = () => {
        const parsed = parseAndFormatDate(displayValue!);
        if (parsed) {
            applyDate(parsed);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            parseDate();
            // Move to next field or submit
            if (onEnterNext) {
                setTimeout(() => onEnterNext(), 50);
            }
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

    const handleBlur = () => {
        parseDate();
    };

    const handleCalendarSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;
        applyDate(selectedDate);
        setCalendarOpen(false);
        // Move to next field after calendar selection
        if (onEnterNext) {
            setTimeout(() => onEnterNext(), 50);
        }
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
                return;
            }
            if (!isNaN(parsed.getTime())) {
                const formatted = parsed.toLocaleDateString("en-GB").replace(/\//g, "-");
                setDisplayValue(formatted);
            }
        } else {
            setDisplayValue("");
        }
    }, [form.watch(name)]);

    // Sync calendar when form value changes from elsewhere
    const calendarDate = (() => {
        const v = form.watch(name);
        if (!v) return undefined;
        const d = typeof v === 'string' || typeof v === 'number' ? new Date(v) : v instanceof Date ? v : null;
        return d && !isNaN(d.getTime()) ? d : undefined;
    })();

    return (
        <div className="flex gap-1 items-center">
            <Input
                ref={inputRef}
                type="text"
                placeholder="DD-MM-YYYY"
                value={displayValue!}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                autoFocus={autoFocus}
                className="flex-1 min-w-0"
            />
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" tabIndex={-1}>
                        <CalendarDays className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        selected={calendarDate}
                        onSelect={handleCalendarSelect}
                        initialFocus
                        disabled={(date) => {
                            if (!fyStart || !fyEnd) return false;
                            return startOfDay(date) < startOfDay(fyStart) || startOfDay(date) > startOfDay(fyEnd);
                        }}
                    />
                </PopoverContent>
            </Popover>
            <span className="hidden">
                <FormInputField type='date' form={form}
                    label=''
                    noLabel
                    gapClass="grid-cols-[1fr] gap-0"
                    name={name} />
            </span>
        </div>
    )
}