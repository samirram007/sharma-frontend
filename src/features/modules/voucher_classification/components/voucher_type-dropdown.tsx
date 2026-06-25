import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { fetchVoucherTypeService } from "../../voucher_type/data/api";
import type { VoucherType } from "../../voucher_type/data/schema";
import type { VoucherClassificationForm } from "../types/types";


type Props = {
    form: UseFormReturn<VoucherClassificationForm>;
};
const VoucherTypeDropdown = (props: Props) => {
    const { form } = props as Props;
    const { data: voucherTypeList, isLoading } = useQuery({
        queryKey: ["voucherTypes"],
        queryFn: fetchVoucherTypeService,
    });

    const voucherTypeId = form.watch('voucherTypeId') as string | number | undefined;; // Watch form value for reactivity
    const voucherType: VoucherType | null = useMemo(() => {
        if (!voucherTypeList?.data) return null;
        return voucherTypeList.data.find((type: VoucherType) => type.id === Number(voucherTypeId)) || null;
    }, [voucherTypeId, voucherTypeList?.data]);

    const handleValueChange = (value: string) => {
        form.setValue('voucherTypeId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <>
            <FormField
                control={form.control}
                name='voucherTypeId'
                render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1 '>
                        <FormLabel className='col-span-2 text-right mt-3'>
                            Voucher Type
                        </FormLabel>
                        <div className="w-full flex gap-2 flex-row items-center justify-start col-span-4 space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select an accounting group'
                                className='w-11/12 col-span-6 md:col-span-4'
                                items={voucherTypeList?.data.map((voucherType: VoucherType) => ({
                                    label: capitalizeAllWords(voucherType.name),
                                    value: String(voucherType.id),
                                }))}
                            />
                            {voucherType && (
                                <HoverCard>
                                    <HoverCardTrigger>

                                        <div className='text-muted-foreground  '><InfoCircledIcon className="cursor-pointer" fontSize={24} /> </div>

                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                        <div className='font-bold border-b-2'>{voucherType?.name}</div>
                                        <div className="font-normal text-sm  ">{voucherType?.description}</div>
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

export default VoucherTypeDropdown