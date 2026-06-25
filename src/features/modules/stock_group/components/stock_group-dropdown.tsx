
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import FormInputField from "@/components/form-input-field";
import { fetchStockGroupService } from "../data/api";
import type { StockGroup } from "../data/schema";
import type { StockGroupForm } from "../types/types";



type Props = {
    form: UseFormReturn<StockGroupForm>;
};
const StockGroupDropdown = (props: Props) => {
    const { form } = props as Props;
    const { data: StockGroupList, isLoading } = useQuery({
        queryKey: ["StockGroups"],
        queryFn: fetchStockGroupService,
    });


    if (isLoading) {
        return <div>Loading...</div>;
    }
    return <FormInputField type='select' form={form} name='parentId' label='Under' items={StockGroupList?.data.map((stockGroup: StockGroup) => ({
        label: capitalizeAllWords(stockGroup.name),
        value: String(stockGroup.id),
    }))} />


}

export default StockGroupDropdown