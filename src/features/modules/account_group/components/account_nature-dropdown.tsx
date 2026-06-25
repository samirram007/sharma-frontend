import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";
import { fetchAccountNatureService } from "../../account_nature/data/api";
import { type AccountNature } from "../../account_nature/data/schema";
import type { AccountGroupForm } from "../types/types";


type Props = {
    form: UseFormReturn<AccountGroupForm>;
};
const AccountNatureDropdown = (props: Props) => {
    const { form } = props;
    const { data: accountNatureList, isLoading } = useQuery({
        queryKey: ["accountNatures"],
        queryFn: fetchAccountNatureService,
    });
    const nullItem = { label: "--select an account group--", value: undefined }
    // const accountNatureId = form.watch('accountNatureId') as string | number | undefined;
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <>

            <FormField

                control={form.control}
                name='accountNatureId'
                render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-right'>
                            Accounting Nature  
                        </FormLabel>
                        <SelectDropdown
                            isControlled={true}
                            defaultValue={field.value?.toString() ?? undefined} 
                            onValueChange={(val) => field.onChange(Number(val))}
                            placeholder='Select an accounting nature'
                            className='col-span-4'
                            items={[
                                nullItem,
                                ...(accountNatureList?.data.map((accountNature: AccountNature) => ({
                                    label: capitalizeAllWords(accountNature.name),
                                    value: String(accountNature.id),
                                })) || []),
                            ]}
                            // disabled={form.getValues('parentId') !== null}
                        />
                        <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                )}
            />
        </>

    )
}

export default AccountNatureDropdown