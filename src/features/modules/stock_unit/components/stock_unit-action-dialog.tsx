'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form
} from '@/components/ui/form'


import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useForm, type Resolver } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'

import { Separator } from '@/components/ui/separator'
import { storeStockUnitService, updateStockUnitService } from '../data/api'

import { formSchema, type StockUnit, type StockUnitForm } from '../data/schema'
import PrimaryStockUnitDropdown from './dropdown/primary_stock_unit-dropdown'
import SecondaryStockUnitDropdown from './dropdown/secondary_stock_unit-dropdown'
import UnitTypeSelect from './dropdown/unit_type-select'
import UqcDropdown from './dropdown/uqc-dropdown'





interface Props {
  currentRow?: StockUnit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockUnitActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateStockUnit = useMutation({
    mutationFn: async (data: StockUnitForm) => {
      // Here you would typically make an API call to save the account group
      // For example: 
      if (isEdit && currentRow) {
        return await updateStockUnitService({ ...data, id: currentRow.id })
      }
      else if (!isEdit) {
        return await storeStockUnitService(data);
      }
    },
    onSuccess: (data) => {
      console.log(data, 'Stock Unit saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['StockUnits'] })
    },
  })

  const form = useForm<StockUnitForm>({
    resolver: zodResolver(formSchema) as Resolver<StockUnitForm>,
    defaultValues: isEdit
      ? {
        ...currentRow,
        isEdit, status: (currentRow?.status as "active" | "inactive") ,
      }
      : {
        unitType: "simple",
        name: "",
        code: "",
        quantityType: undefined,
        uniqueQuantityCodeId: undefined,
        primaryStockUnitId: undefined,
        secondaryStockUnitId: undefined,
        conversionFactor: 1,
        noOfDecimalPlaces: 0,
        status: "active",
        isEdit,
      },
  });
  const unitType = form.watch("unitType");
  const gapClass = 'grid grid-cols-[200px_1fr]! gap-x-0   justify-start ' 
  const onSubmit = (values: StockUnitForm) => {

    if (values.unitType === 'compound') {
      const primaryUnit = values.primaryStockUnit;
      const secondaryUnit = values.secondaryStockUnit;
      const conversion = values.conversionFactor;
      // console.log(primaryUnit, secondaryUnit)
      // Only proceed if both units exist and are different
      if (primaryUnit && secondaryUnit && primaryUnit.id !== secondaryUnit.id) {
        const name = `${primaryUnit.name} of ${conversion} ${secondaryUnit.name}`;
        const code = `${primaryUnit.code} of ${conversion} ${secondaryUnit.code}`;

        values.name = name;
        values.code = code;
        // form.setValue('code', code);
      } else {
        // Optional: fallback if same units
        form.setValue('name', primaryUnit?.name ?? '');
        form.setValue('code', primaryUnit?.code ?? '');
        form.setError("root", {
          type: "manual",
          message: "Primary and Secondary units cannot be the same.",
        });
        return; // prevent submission
      }
    }

    form.reset()
    // showSubmittedData(values) 
    mutateStockUnit.mutate(values)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left border-b-2 pb-2'>
          <DialogTitle>{isEdit ? 'Edit Stock Unit' : 'Add New Stock Unit'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the Stock Unit here. ' : 'Create new Stock Unit here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='mr-0 h-[26.25rem] min-h-[30vh] md:h-auto w-full overflow-y-auto py-1  '>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <UnitTypeSelect form={form} gapClass={gapClass} />
              {
                unitType === 'simple' ?
                  <>
                    <FormInputField type='text' gapClass={gapClass} form={form} name='code' label='Symbol' />
                    <FormInputField type='text' gapClass={gapClass} form={form} name='name' label='Formal Name' />
                    <UqcDropdown form={form} gapClass={gapClass} />
                    <FormInputField type='number' gapClass={gapClass} form={form} name='noOfDecimalPlaces' label='No. of Decimal places' />
                  </>
                  :
                  <>
                    <div className="grid grid-cols-[80px_1fr_80px]">
                      <div></div>
                      <div className='flex flex-col items-center justify-center'>
                        <div className='text-xl'>Units with multiplier factors</div>
                        <Separator className=' bg-amber-700' />
                        <div className='italic text-gray-600'>(Example: Kgs of 1000 gms)</div>
                      </div>
                      <div></div>
                    </div>
                    <div className='grid grid-rows-2'>
                      <div className='grid  grid-cols-[1fr_100px_1fr] gap-2 '>
                        <div>First unit</div>
                        <div className='  px-2'>Conversion</div>
                        <div>Second unit</div>
                      </div>
                      <div className='grid grid-cols-[1fr_100px_1fr] gap-2 '>

                        <PrimaryStockUnitDropdown form={form} />
                        <FormInputField type='number'
                          gapClass={'grid grid-cols-[20px_1fr] gap-x-0   justify-start '}
                          form={form}
                          name='conversionFactor'
                          label='of' />
                        <SecondaryStockUnitDropdown form={form} />
                      </div>
                    </div>
                    {form.formState.errors.root && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-400 text-red-700 rounded-md text-sm flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-4.75a.75.75 0 11-1.5 0v-4a.75.75 0 011.5 0v4zm0-6a.75.75 0 11-1.5 0V7a.75.75 0 011.5 0v.25z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {form.formState.errors.root.message}
                      </div>
                    )}
                  </>
              } 
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}
