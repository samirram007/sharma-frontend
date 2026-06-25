import { createContext, useContext } from "react"
import { useForm, type Resolver, type UseFormReturn } from "react-hook-form"
import { formSchema, type ReceiptNoteForm } from "../../data/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"




type PosFormContextType = UseFormReturn<ReceiptNoteForm>

const FormContext = createContext<PosFormContextType | null>(null)

export const useReceiptForm = () => {
    const ctx = useContext(FormContext)
    if (!ctx) throw new Error("useReceiptForm must be used inside FormProvider")
    return ctx
}

export const FormProvider = ({ children }: {
    children: React.ReactNode
}) => {

    const mainForm = useForm<ReceiptNoteForm>({
        resolver: zodResolver(formSchema) as Resolver<ReceiptNoteForm>,
        // defaultValues: defaultValues,
    })

    // const handleEnterAsTab = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    //     if (e.key === "Enter") {
    //         e.preventDefault() // prevent form submit

    //         const form = e.currentTarget.form
    //         if (!form) return

    //         const focusable = Array.from(
    //             form.querySelectorAll<HTMLElement>(
    //                 'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
    //             )
    //         ).filter((el) => el.tabIndex >= 0)

    //         const index = focusable.indexOf(e.currentTarget)
    //         if (index >= 0 && index < focusable.length - 1) {
    //             focusable[index + 1].focus()
    //         }
    //     }
    // }

    const handleOnSubmit = (values: ReceiptNoteForm) => {
        mainForm.reset()
        console.log(values)
    }
    return (

        <div className="voucher-entry w-full grid grid-rows-[1fr_100px] 
         h-[calc(100dvh-170px)] ">
            {children}
            <Form {...mainForm}   >

                <FormContext.Provider value={mainForm}>
                    {/* <FocusTrap> */}

                    <form onSubmit={() => handleOnSubmit(mainForm.getValues())}>
                        {children}
                    </form>
                    {/* </FocusTrap> */}
                </FormContext.Provider>
            </Form>
        </div>
    )
}
