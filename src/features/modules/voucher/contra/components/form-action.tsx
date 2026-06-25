'use client'

import { Button } from '@/components/ui/button'
import {
    Form
} from '@/components/ui/form'


import FormInputField from '@/components/form-input-field'
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { lowerCase } from '@/utils/removeEmptyStrings'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useContraMutation } from '../data/queryOptions'
import { formSchema, type Contra, type ContraForm } from '../data/schema'

interface Props {
    currentRow?: Contra
}
export function FormAction({ currentRow }: Props) {
    const isEdit = !!currentRow


    const { mutate: saveContra, isPending } = useContraMutation()

    const form = useForm<ContraForm>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit
            ? { ...currentRow, isEdit }
            : {
                name: '',
                code: '',

                isEdit,
            },
    })
    //  const contraStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];

    const moduleName = "Contra"
    const onSubmit = (values: ContraForm) => {
        form.reset()
        saveContra(
            currentRow ? { ...values, id: currentRow.id! } : values,
            {
                onSuccess: () => {

                },
            }
        )

    }


    return (


        <Dialog>
            <DialogHeader className='text-left'>
                <DialogTitle>{isEdit ? 'Edit ' : 'Add New '} {moduleName}</DialogTitle>
                <DialogDescription>
                    {isEdit ? `Update the ${lowerCase(moduleName)} here. `
                        : `Create new ${lowerCase(moduleName)} here. `}
                    Click save when you&apos;re done.
                </DialogDescription>
            </DialogHeader>

            <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
                <Form {...form}>
                    <form
                        id='user-form'
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4 p-0.5'
                    >
                        <FormInputField type='text' form={form} name='name' label='Name' />
                        <FormInputField type='text' form={form} name='code' label='Code' />



                    </form>
                </Form>
            </div>
            <DialogFooter>
                <Button type='submit' form='user-form' disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Saving..." : "Save changes"}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}