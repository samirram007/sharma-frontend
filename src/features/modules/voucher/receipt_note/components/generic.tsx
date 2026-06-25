import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Controller } from "react-hook-form";
import { useReceiptForm } from "../contexts/form-context";
import type { ReceiptNoteForm } from "../data/schema";


export const TextBox = ({ name, label }: { name: keyof ReceiptNoteForm; label: string }) => {
    const form = useReceiptForm();
    return (
        <Controller
            control={form.control}
            name={name as any}
            render={({ field }) => (
                <div className="space-y-1">
                    <label className="text-sm font-medium">{label}</label>
                    <Input {...field} />
                </div>
            )}
        />
    );
};

export const TextAreaBox = ({ name, label }: { name: keyof ReceiptNoteForm; label: string }) => {
    const form = useReceiptForm();
    return (
        <Controller
            control={form.control}
            name={name as any}
            render={({ field }) => (
                <div className="space-y-1">
                    <label className="text-sm font-medium">{label}</label>
                    <Textarea {...field} />
                </div>
            )}
        />
    );
};
