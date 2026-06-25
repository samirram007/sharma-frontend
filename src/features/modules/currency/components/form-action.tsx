'use client'

import { Button } from '@/components/ui/button'
import {
    Form
} from '@/components/ui/form'


import FormInputField from '@/components/form-input-field'
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Route as CurrencyRoute } from '@/routes/_protected/masters/organization/_layout/currency/_layout'
import { lowerCase } from '@/utils/removeEmptyStrings'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { storeCurrencyService, updateCurrencyService } from '../data/api'
import { formSchema, type Currency, type CurrencyForm } from '../data/schema'
import CountryDropdown from './country-dropdown'
interface Props {
    currentRow?: Currency
}
export function FormAction({ currentRow }: Props) {
    const isEdit = !!currentRow
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { mutate: saveCurrency, isPending } = useMutation({
        mutationFn: async (data: CurrencyForm) => {
            // Here you would typically make an API call to save the Currency
            // For example:
            console.log('Saving Currency:', data);
            if (isEdit && currentRow) {
                return await updateCurrencyService({ ...data, id: currentRow.id })
            }
            else if (!isEdit) {
                return await storeCurrencyService(data);
            }
        },
        onSuccess: (data) => {
            console.log(data, 'Currency saved successfully!')
            queryClient.invalidateQueries({ queryKey: ['currencys'] })
        },
    })

    const form = useForm<CurrencyForm>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit
            ? {
                ...currentRow, isEdit, exchangeRate: "",
            }
            : {
                name: '',
                code: '',
                status: 'active',
                exchangeRate: '',
                symbol: '',
                decimalPlaces: '',
                format: '',
                thousandsSeparator: '',
                decimalSeparator: ',',
                symbolPosition: 'before',
                country: 'India',
                isEdit
            },
    })
    //  const currencyStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];

    const moduleName = "Currency"
    const labelLayoutClass = 'sm:grid-cols-[160px_1fr]'
    const onSubmit = (values: CurrencyForm) => {
        showSubmittedData(values)
        saveCurrency(currentRow ? { ...values, id: currentRow.id! } : values, {
            onSuccess: () => {
                form.reset()
                navigate({ to: CurrencyRoute.to })
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
                                <h3 className='text-sm font-semibold text-slate-800 dark:text-slate-200'>Basic Information</h3>
                                <p className='text-xs text-slate-500 dark:text-slate-400'>Core identity and geographic settings for the currency record.</p>
                            </div>
                            <div className='space-y-4'>
                                <FormInputField type='text' gapClass={labelLayoutClass} form={form} name='name' label='Name' />
                                <FormInputField type='text' gapClass={labelLayoutClass} form={form} name='code' label='Code' />
                                <FormInputField type='text' gapClass={labelLayoutClass} form={form} name='symbol' label='Symbol' />
                                <FormInputField type='text' gapClass={labelLayoutClass} form={form} name='symbolPosition' label='Symbol Position' />
                                <CountryDropdown form={form} gapClass={labelLayoutClass} />
                            </div>
                        </section>
                        <section className='space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]'>
                            <div className='space-y-1'>
                                <h3 className='text-sm font-semibold text-slate-800 dark:text-slate-200'>Formatting Rules</h3>
                                <p className='text-xs text-slate-500 dark:text-slate-400'>Control exchange rate and number separators used when formatting currency values.</p>
                            </div>
                            <div className='space-y-4'>
                                <FormInputField type='text' gapClass={labelLayoutClass} form={form} name='exchangeRate' label='Exchange Rate' />
                                <FormInputField type='text' gapClass={labelLayoutClass} form={form} name='decimalPlaces' label='Decimal Places' />
                                <FormInputField type='text' gapClass={labelLayoutClass} form={form} name='thousandsSeparator' label='Thousands Separator' />
                                <FormInputField type='text' gapClass={labelLayoutClass} form={form} name='decimalSeparator' label='Decimal Separator' />
                                <FormInputField type='checkbox' gapClass={labelLayoutClass} form={form} name='status' label='Status' options={[
                                    { label: 'Active', value: 'active' },
                                    { label: 'Inactive', value: 'inactive' },
                                ]} />
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