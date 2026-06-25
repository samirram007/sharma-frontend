import { getData } from "@/utils/dataClient";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// generic enum schema (array of strings)
const EnumResponseSchema = z.object({
    data: z.array(z.string()),
});

const fetchEnum = async (enumName: string) => {
    const res = await getData(`/enums/${enumName}`);
    // console.log(EnumResponseSchema.parse(res).data, 'enum data');
    return EnumResponseSchema.parse(res).data;
};

export const useEnum = (enumName: string) => {
    return useQuery<string[]>({
        queryKey: ["enum", enumName],
        queryFn: () => fetchEnum(enumName),
    });
};

// 👇 usage
