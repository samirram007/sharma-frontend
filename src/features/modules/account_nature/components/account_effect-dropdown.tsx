import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import type { UseFormReturn } from "react-hook-form";
import type { accountingEffects, AccountNatureForm } from "../data/schema";

type Props = {
    form: UseFormReturn<AccountNatureForm>;
}

const AccountEffectDropdown = (props: Props) => {
    const { form } = props
    const accountEffectOptions: accountingEffects[] = ['debit', 'credit'];
    return (
        <FormField
            control={form.control}
            name='accountingEffect'
            render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                        Accounting Effect
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(val) => field.onChange(Number(val))}
                        placeholder='Select an accounting effect'
                        className='col-span-4'
                        items={accountEffectOptions.map((value) => ({
                            label: capitalizeAllWords(value),
                            value,
                        }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
            )}
        />
    )
}

export default AccountEffectDropdown