import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { usePos } from "@/features/modules/voucher/contexts/pos-context"
import { cn } from "@/lib/utils"
import { capitalizeAllWords } from "@/utils/removeEmptyStrings"
import { useRef } from "react"
import type { Control, UseFormReturn } from "react-hook-form"

type Option = { label: string; value: string | boolean };
type InputType = 'hidden' | 'text' | 'number' | 'textarea' | 'checkbox' | 'select' | 'multiselect' | 'date';
type Props = {
    form: UseFormReturn<any>;
    control?: Control<any>;
    type: InputType;
    name: string;
    label?: string;
    noLabel?: boolean;
    options?: Option[];
    items?: { label: string; value: string }[];
    gapClass?: string;
    disabled?: boolean;
    rtl?: boolean
    tabIndex?: number
    [key: string]: any;
    handleSaving?: () => Promise<void>;
}
const NarrationBox = (props: Props) => {
    const { form, name, gapClass, rtl, label, noLabel, handleSaving, isSaving, setSaving, ...rest } = props
    const { remarksRef, isRemarksDisabled, setIsRemarksDisabled } = usePos();

    //ondouble enter save
    // const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    //     if (e.key === "Enter" && e.nativeEvent.getModifierState("Shift")) {
    //         e.preventDefault();
    //         if (handleSaving) {
    //             await handleSaving();
    //         }
    //     }
    // };

    const lastEnterTimeRef = useRef<number>(0);
    const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.shiftKey || e.ctrlKey)) {
            e.preventDefault();
            setSaving(true);
            if (handleSaving) {
                await handleSaving();
            }
        }
        if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
            const now = Date.now();
            if (now - lastEnterTimeRef.current < 400) {
                e.preventDefault();
                setSaving(true);
                if (handleSaving) {
                    await handleSaving();
                }
            }
            lastEnterTimeRef.current = now;
        }
    };


    const handleOnClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        if (isRemarksDisabled) {
            setIsRemarksDisabled?.(false);   // unlock
            return;                        // wait for re-render
        }

        e.currentTarget.select();         // auto-select after unlocked
    };
    const handleBlur = () => {
        setIsRemarksDisabled?.(true);
    }
    return (
        <FormField
            control={form.control}
            name={name}

            render={({ field }) => (
                <FormItem
                    className={cn(
                        'space-y-0 gap-0 items-start flex flex-col ',
                        gapClass
                    )}   >
                    {!noLabel &&
                        <FormLabel className={rtl ? 'order-last' : ''}>
                            {label ?? capitalizeAllWords(name)}
                        </FormLabel>
                    }
                    <FormControl>
                        <Textarea
                            readOnly={isRemarksDisabled}
                            onClick={handleOnClick}
                            ref={remarksRef!}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            className='resize-none 
                            text-slate-600 bg-gray-800/10 
                            border-2 border-gray-800/20
                            focus:text-yellow-200
                            focus:bg-gray-800/20
                            focus:border-yellow-200
                            focus:outline-none
                            placeholder:italic placeholder:text-gray-400 '
                            placeholder={`Add a ${name} to your entry`}
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}

                            // {...field}
                        />
                    </FormControl>
                    <FormMessage className=' col-start-2' />
                </FormItem>
            )}
            {...rest}
        />
    )
}

export default NarrationBox