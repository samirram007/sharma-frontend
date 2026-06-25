import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { fetchVoucherCategoryService } from "../../voucher_category/data/api";
import { type VoucherCategory } from "../../voucher_category/data/schema";
import type { VoucherTypeForm } from "../types/types";



type Props = {
    form: UseFormReturn<VoucherTypeForm>;
};
const VoucherCategoryDropdown = (props: Props) => {
    const { form } = props as Props;
    const { data: voucherCategoryList, isLoading } = useQuery({
        queryKey: ["voucherCategorys"],
        queryFn: fetchVoucherCategoryService,
    });

    const voucherCategoryId = form.watch('voucherCategoryId') as string | number | undefined;; // Watch form value for reactivity
    const voucherCategory: VoucherCategory | null = useMemo(() => {
        if (!voucherCategoryList?.data) return null;
        return voucherCategoryList.data.find((group: VoucherCategory) => group.id === Number(voucherCategoryId)) || null;
    }, [voucherCategoryId, voucherCategoryList?.data]);

    const handleValueChange = (value: string) => {
        form.setValue('voucherCategoryId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <>
            <FormField
                control={form.control}
                name='voucherCategoryId'
                render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1 '>
                        <FormLabel className='col-span-2 text-right mt-3'>
                            Voucher Category
                        </FormLabel>
                        <div className="w-full flex gap-2 flex-row items-center justify-start col-span-4 space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select a voucher category'
                                className='w-11/12 col-span-6 md:col-span-4'
                                items={voucherCategoryList?.data.map((voucherCategory: VoucherCategory) => ({
                                    label: capitalizeAllWords(voucherCategory.name),
                                    value: String(voucherCategory.id),
                                }))}
                            />
                            {voucherCategory && (
                                <HoverCard>
                                    <HoverCardTrigger>

                                        <div className='text-muted-foreground  '><InfoIcon className="cursor-pointer" size={24} /> </div>

                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                        <div className='font-bold border-b-2'>{voucherCategory?.name}</div>
                                        <div className="font-normal text-sm  ">{voucherCategory?.description}</div>
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

export default VoucherCategoryDropdown