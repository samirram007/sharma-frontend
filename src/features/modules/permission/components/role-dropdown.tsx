
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import FormInputField from "@/components/form-input-field";
import { fetchRoleService } from "../../role/data/api";
import type { Role } from "../../role/data/schema";
import type { PermissionForm } from "../data/schema";




type Props = {
    form: UseFormReturn<PermissionForm>;
};
const RoleDropdown = (props: Props) => {
    const { form } = props as Props;
    const { data: RoleList, isLoading } = useQuery({
        queryKey: ["Role"],
        queryFn: fetchRoleService,
    });


    if (isLoading) {
        return <div>Loading...</div>;
    }
    return <FormInputField type='select' form={form} name='roleId' label='Role'
        items={
            RoleList?.data.map((role: Role) => ({
                label: capitalizeAllWords(role.name),
                value: String(role.id),
            }))
        } />


}

export default RoleDropdown