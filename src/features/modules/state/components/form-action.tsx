'use client'

import { Button } from '@/components/ui/button'
import {
    Form
} from '@/components/ui/form'


import FormInputField from '@/components/form-input-field'
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Route as StateRoute } from '@/routes/_protected/masters/organization/_layout/state/_layout'
import { lowerCase } from '@/utils/removeEmptyStrings'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { storeStateService, updateStateService } from '../data/api'
import { formSchema, type State, type StateForm } from '../data/schema'
import CountryDropdown from './country-dropdown'
interface Props {
    currentRow?: State
}
export function FormAction({ currentRow }: Props) {
    const isEdit = !!currentRow
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { mutate: saveState, isPending } = useMutation({
        mutationFn: async (data: StateForm) => {
            // Here you would typically make an API call to save the State
            // For example:
            console.log('Saving State:', data);
            if (isEdit && currentRow) {
                return await updateStateService({ ...data, id: currentRow.id })
            }
            else if (!isEdit) {
                return await storeStateService(data);
            }
        },
        onSuccess: (data) => {
            console.log(data, 'State saved successfully!')
            queryClient.invalidateQueries({ queryKey: ['states'] })
        },
    })

    const form = useForm<StateForm, any, StateForm>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit
            ? {
                ...currentRow, isEdit,
            }
            : {
                name: '',
                code: '',
                gstCode: '',
                countryId: 76,
                isEdit,
            },
    })
    //  const stateStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];

    const moduleName = "State"
    const labelLayoutClass = 'sm:grid-cols-[160px_1fr]'
    const onSubmit = (values: StateForm) => {
        showSubmittedData(values)
        saveState(currentRow ? { ...values, id: currentRow.id! } : values, {
            onSuccess: () => {
                form.reset()
                navigate({ to: StateRoute.to })
            },
        })
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

            <div className='ml-0 mr-auto h-full w-full max-w-3xl overflow-y-auto overflow-x-hidden py-0 sm:py-1'>
                <Form {...form}>
                    <form
                        id='user-form'
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4 p-0 sm:space-y-6 sm:p-1'
                    >
                        <section className='space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]'>
                            <div className='space-y-1'>
                                <h3 className='text-sm font-semibold text-slate-800 dark:text-slate-200'>State Details</h3>
                                <p className='text-xs text-slate-500 dark:text-slate-400'>Define the state code, GST mapping, and country association used in regional setup.</p>
                            </div>
                            <div className='space-y-4'>
                                <FormInputField type='text' gapClass={labelLayoutClass} form={form} name='name' label='Name' />
                                <FormInputField type='text' gapClass={labelLayoutClass} form={form} name='code' label='Code' />
                                <FormInputField type='text' gapClass={labelLayoutClass} form={form} name='gstCode' label='GST Code' />
                                <CountryDropdown form={form} gapClass={labelLayoutClass} />
                            </div>
                        </section>

                    </form>
                </Form>
            </div>
            <DialogFooter className='ml-0 mr-auto w-full max-w-3xl border-t border-slate-200/70 pt-4 sm:justify-start dark:border-white/[0.07]'>
                <Button type='submit' form='user-form' disabled={isPending}>
                    {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    {isPending ? 'Saving...' : 'Save changes'}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}