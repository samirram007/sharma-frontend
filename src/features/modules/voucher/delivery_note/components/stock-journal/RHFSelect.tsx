import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useFormContext } from "react-hook-form"

type DropdownProps = {
    name: string
    options: {
        name: string
        id: number
    }[]
    placeholder?: string
}

export const RHFSelect = ({ name, options, placeholder }: DropdownProps) => {
    const { setValue, watch } = useFormContext()
    const [open, setOpen] = useState(false);
    const selectedValue = watch(name)

    return (
        <Select
            value={selectedValue?.toString() || ""}
            onValueChange={(value) => setValue(name, Number(value))}
            open={open}
            onOpenChange={setOpen}
        >
            <SelectTrigger className="w-48"
            // onFocus={() => setOpen(true)}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="0" aria-selected >
                    {`-plese select ${placeholder}`}
                </SelectItem>
                {options.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id.toString()}>
                        {opt.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
