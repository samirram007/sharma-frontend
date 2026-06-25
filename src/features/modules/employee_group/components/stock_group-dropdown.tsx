
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import FormInputField from "@/components/form-input-field";
import { fetchEmployeeGroupService } from "../data/api";
import type { EmployeeGroup } from "../data/schema";
import type { EmployeeGroupForm } from "../types/types";



type Props = {
    form: UseFormReturn<EmployeeGroupForm>;
};
const EmployeeGroupDropdown = (props: Props) => {
    const { form } = props as Props;
    const { data: EmployeeGroupList, isLoading } = useQuery({
        queryKey: ["EmployeeGroups"],
        queryFn: fetchEmployeeGroupService,
    });


    if (isLoading) {
        return <div>Loading...</div>;
    }
    return <FormInputField type='select' form={form} name='parentId' label='Under' items={EmployeeGroupList?.data.map((employeeGroup: EmployeeGroup) => ({
        label: capitalizeAllWords(employeeGroup.name),
        value: String(employeeGroup.id),
    }))} />


}

export default EmployeeGroupDropdown