'use client'

import { Button } from '@/components/ui/button'
import {
    Form
} from '@/components/ui/form'


import FormInputField from '@/components/form-input-field'
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Route as UserRoute } from '@/routes/_protected/administration/_layout/user/_layout'
import { lowerCase } from '@/utils/removeEmptyStrings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { useUserMutation } from '../data/queryOptions'
import { formSchema, type User, type UserForm } from '../data/schema';

interface Props {
    currentRow?: User
}
export function FormAction({ currentRow }: Props) {
    const isEdit = !!currentRow
    const navigate = useNavigate();

    const { mutate: saveUser, isPending } = useUserMutation()

    const form = useForm<UserForm>({
        resolver: zodResolver(formSchema) as Resolver<UserForm>,
        defaultValues: isEdit
            ? {
                ...currentRow,
                email: currentRow.email ?? '',
                username: currentRow.username ?? '',
                userType: currentRow.userType ?? '',
                isEdit
            }
            : {
                name: '', 
                status: 'active',
                email: '',
                username: '', 


                isEdit,
            },
    })
    //  const userStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];
    const gapClass = 'grid grid-cols-[120px_1fr] gap-4'
    const moduleName = "User"
    const onSubmit = (values: UserForm) => {
        console.log("here: ", values)
        form.reset()
        saveUser(
            currentRow ? { ...values, id: currentRow.id! } : values,
            {
                onSuccess: () => {
                    navigate({ to: UserRoute.to, })
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



            <div className='  h-full max-w-full  overflow-y-auto py-1  '>
                <Form {...form}>
                    <form
                        id='user-form'
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4 p-0.5'
                    >
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-4'>

                                <FormInputField type='text' gapClass={gapClass} form={form} name='name' label='Name' />
                                <FormInputField type='text' gapClass={gapClass} form={form} name='email' label='Email' />
                                <FormInputField type='text' gapClass={gapClass} form={form} name='username' label='Username' />
                                <FormInputField type='text' gapClass={gapClass} form={form} name='password' label='Passsword' />

                                <FormInputField type='checkbox' form={form} name='status' label='Status' options={[
                                    { label: 'Active', value: 'active' },
                                    { label: 'Inactive', value: 'inactive' },
                                ]} />
                            </div>
                            <div className='space-y-4'>


                            </div>
                        </div>






                    </form>
                </Form>
            </div>


            <DialogFooter className='flex flex-row justify-end! py-4 border-t-2 border-orange-900/50 max-w-full w-[95%] text-center'>

                <Button type='submit' className='self-center' form='user-form'
                    disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Saving..." : "Save changes"}
                </Button>
            </DialogFooter>

        </Dialog>
    )
}