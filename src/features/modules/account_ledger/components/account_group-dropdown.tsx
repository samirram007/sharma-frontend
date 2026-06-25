import { SelectDropdown } from "@/components/select-dropdown";
import { Badge } from "@/components/ui/badge";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { fetchAccountGroupService } from "@/features/masters/accounts/services/apis";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { type AccountGroup } from "../../account_group/data/schema";
import type { AccountNature } from "../../account_nature/data/schema";
import type { AccountLedgerForm } from "../data/schema";



type Props = {
    form: UseFormReturn<AccountLedgerForm>;
};
const AccountGroupDropdown = (props: Props) => {
    const { form } = props as Props;
    const { data: accountGroupList, isLoading } = useQuery({
        queryKey: ["accountGroups"],
        queryFn: fetchAccountGroupService,
    });

    const accountGroupId = form.watch('accountGroupId') as string | number | undefined; // Watch form value for reactivity
    const accountNature: AccountNature | null = useMemo(() => {
        if (!accountGroupList?.data) return null;
        return accountGroupList.data.find((group: AccountGroup) => group.id === Number(accountGroupId))?.accountNature || null;
    }, [accountGroupId, accountGroupList?.data]);

    const handleValueChange = (value: string) => {
        form.setValue('accountGroupId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <>
            <FormField
                control={form.control}
                name='accountGroupId'
                render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1 '>
                        <FormLabel className='col-span-2 text-right mt-3'>
                            Accounting Group
                        </FormLabel>
                        <div className="w-full col-span-4 space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select an accounting group'
                                className='w-full col-span-6 md:col-span-4'
                                items={accountGroupList?.data.map((accountGroup: AccountGroup) => ({
                                    label: capitalizeAllWords(accountGroup.name),
                                    value: String(accountGroup.id),
                                }))}
                            />
                            {accountNature && (
                                <HoverCard>
                                    <HoverCardTrigger>
                                        <Badge variant='secondary' className='capitalize'  >
                                            <div className='text-muted-foreground  '>{accountNature?.name} </div>
                                        </Badge>
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                        Account Nature: {accountNature?.name}
                                    </HoverCardContent>
                                </HoverCard>
                            )}

                        </div>
                        <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                )}
            />
        </>

    )
}

export default AccountGroupDropdown