import { useQuery } from '@tanstack/react-query'

import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { date_format } from '../../../../../utils/removeEmptyStrings'
import {
  freightReceiptQueryOptions,
  useFreightReceiptMutation,
} from './data/queryOptions'
import { freightReceiptSchema } from './data/schema'
import FreightReceiptProvider, {
  useFreightReceiptContext,
} from './contexts/freight_receipt-context'
import type { Resolver, UseFormReturn } from 'react-hook-form'
import type { FreightVoucherSchema } from '../data/schema'
import type { VoucherSchema } from '../../data-schema/voucher-schema'
import type { FreightReceiptForm } from './data/schema'
import { Badge } from '@/components/ui/badge'

import { Form } from '@/components/ui/form'
import FormInputField from '@/components/form-input-field'
import { SkeletonButton, SkeletonTable } from '@/components/skeleton'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type FreightReceiptProps = {
  freight: FreightVoucherSchema
}

const FreightReceipt = (props: FreightReceiptProps) => {
  const { freight } = props
  return (
    <FreightReceiptProvider>
      <ReceiptVoucherEntry freight={freight} />
      <PaymentList freightId={freight.id!} />
    </FreightReceiptProvider>
  )
}

export default FreightReceipt

const PaymentList = ({ freightId }: { freightId: number }) => {
  const { totalReceipts, setTotalReceipts } = useFreightReceiptContext()
  const freightReceipts = useQuery(
    freightReceiptQueryOptions(freightId, 'freight_receipt_list'),
  )

  useEffect(() => {
    if (freightReceipts.data?.data) {
      setTotalReceipts(
        freightReceipts.data.data.reduce(
          (acc: number, receipt: VoucherSchema) => acc + receipt.amount!,
          0,
        ),
      )
    }
  }, [freightReceipts.data, totalReceipts])

  if (freightReceipts.isPending)
    return <SkeletonTable colCount={4} rowCount={2} />

  return (
    <div className="flex flex-col gap-2 px-4 border-t pt-2 border-gray-200 text-sm">
      <Badge variant={'outline'}>
        Payment count: {freightReceipts?.data?.data?.length}
      </Badge>
      <div className="grid grid-cols-[200px_150px_1fr_100px] text-sm bg-accent font-semibold">
        <div className="text-center">Receipt No</div>
        <div>Receipt Date</div>
        <div>Payment Mode</div>
        <div className="text-right">Amount</div>
      </div>

      {freightReceipts.data?.data?.map(
        (payment: VoucherSchema, index: number) => (
          <div key={index} className="grid grid-cols-[200px_150px_1fr_100px]">
            <div className="text-center ">{payment.voucherNo}</div>
            <div>{date_format(payment.voucherDate)}</div>
            <div> </div>
            <div className="text-right">{payment.amount?.toFixed(2)}</div>
          </div>
        ),
      )}
      <div className="grid grid-cols-[1fr_100px] text-sm bg-accent font-semibold">
        <div className="text-right pr-4">Total: </div>
        <div className="text-right">{totalReceipts?.toFixed(2)}</div>
      </div>
    </div>
  )
}

const ReceiptVoucherEntry = ({ freight }: FreightReceiptProps) => {
  const { totalReceipts } = useFreightReceiptContext()

  const { mutate: createFreightReceipt, isPending } =
    useFreightReceiptMutation()
  const [isLimiting, setIsLimiting] = useState(0)

  const form = useForm<FreightReceiptForm>({
    resolver: zodResolver(freightReceiptSchema) as Resolver<FreightReceiptForm>,
    defaultValues: {
      receiptId: undefined,
      freightId: freight?.id!,
      receiptNo: '',
      receiptDate: new Date(),
      amount: freight?.amount - totalReceipts || 0,
      partyLedgerId: freight?.partyLedger?.id || 0,
      transactionLedgerId: 1000001,
      paymentMode: 'cash',
      remarks: '',
    },
  })
  const amount = form.watch('amount')

  const handleSubmit = (data: FreightReceiptForm) => {
    if (data.amount > freight.amount - totalReceipts) {
      form.setError('amount', { message: 'Amount cannot exceed balance' })
      // setIsLimiting(1000);
      return
    }
    if (
      amount == 0 ||
      amount === null ||
      amount === undefined ||
      amount.toString().trim() === '' ||
      isNaN(amount) ||
      amount < 0
    ) {
      console.log('Amount', typeof amount)
      // form.setError('amount', { message: 'Amount cannot be zero' })
      toast.error('Amount must be greater than zero')
      // setIsLimiting(1000);
      return
    }

    createFreightReceipt(data, {
      onSuccess: () => {
        console.log('onSuccess')
        form.reset({
          receiptId: undefined,
          freightId: freight?.id!,
          receiptNo: '',
          receiptDate: freight?.voucherDate
            ? new Date(freight.voucherDate)
            : undefined,
          amount: freight?.amount - totalReceipts || 0,
          partyLedgerId: freight?.partyLedger?.id || 0,
          transactionLedgerId: 1000001,
          paymentMode: 'cash',
          remarks: '',
        })
      },
      onError: () => {
        form.reset()
        setIsLimiting(0)
      },
    })
  }
  useEffect(() => {
    if (amount && freight?.amount) {
      const balance = freight.amount - totalReceipts
      if (amount > balance) {
        form.setValue('amount', balance, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  }, [amount, totalReceipts, freight?.amount, form])

  useEffect(() => {
    if (isLimiting) {
      const timer = setTimeout(() => {
        setIsLimiting(0)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isLimiting])

  return (
    <Suspense fallback={<div>Loading Form...</div>}>
      {freight && (
        <div className="p-4 ">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-2 justify-start items-start gap-2">
                <div className="text-sm flex flex-col justify-between mb-4">
                  <div className=" font-bold underline decoration-1 decoration-red-500">
                    Freight Details :{' '}
                  </div>
                  <div className="grid grid-cols-[100px_5px_200px]">
                    <span>Freight No</span>
                    <span>:</span>
                    <span>{freight.voucherNo}</span>
                  </div>
                  <div className="grid grid-cols-[100px_5px_200px]">
                    <span>Party:</span>
                    <span>:</span>
                    <span>{freight.partyLedger?.name}</span>
                  </div>
                  <div className="grid grid-cols-[100px_5px_200px]">
                    <span>Amount:</span>
                    <span>:</span>
                    <span>{freight.amount.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-[100px_5px_200px]">
                    <span>Date:</span>
                    <span>:</span>
                    <span>
                      {freight.voucherDate
                        ? date_format(freight.voucherDate?.split('T')[0])
                        : ''}
                    </span>
                  </div>
                  {/* {freight.data.data.voucherNo} */}
                </div>
                <div className="grid grid-rows-2 justify-end items-end gap-4 pl-4">
                  <FormInputField
                    form={form}
                    name="receiptNo"
                    gapClass="grid grid-cols-[auto_120px] justify-end gap-x-1"
                    label="Rcpt. No."
                    type="text"
                  />
                  {/* <FormInputField form={form} name='receiptDate' gapClass='grid grid-cols-[auto_120px] justify-end gap-x-1' label='Rcpt. Date' type='date' /> */}
                  <div className="grid grid-cols-[auto_120px] justify-end items-center gap-x-1">
                    <div className=" text-sm  mb-1 ">Rcpt. Date : </div>
                    <DateBox form={form} name="receiptDate" />
                  </div>
                </div>
              </div>
              <div className=" ">
                <div className=" text-sm font-bold mb-1 ">Receipt Entry : </div>
              </div>
              <div className="grid grid-cols-3 grid-rows-1 justify-start items-start gap-2 border rounded-md p-4">
                <div className="grid   justify-start items-start   ">
                  <div className="mb-2 text-sm font-bold">Payment Mode : </div>
                  <FormInputField
                    form={form}
                    name="paymentMode"
                    gapClass="grid grid-rows-1! grid-cols-1! justify-end items-end gap-0 pl-0"
                    type="select"
                    noLabel
                    items={[
                      { label: 'Cash', value: 'cash' },
                      { label: 'Cheque', value: 'cheque' },
                      { label: 'Bank Transfer', value: 'bank_transfer' },
                      { label: 'Credit Card', value: 'credit_card' },
                      { label: 'Other', value: 'other' },
                    ]}
                  />
                </div>
                <div className="grid   justify-start items-start   ">
                  <div className="mb-2 text-sm font-bold">
                    Transaction Ledger :{' '}
                  </div>
                  <FormInputField
                    form={form}
                    name="transactionLedgerId"
                    type="select"
                    noLabel
                    gapClass=" grid grid-rows-1! grid-cols-1! justify-end items-end gap-0 pl-0"
                    items={[
                      { label: 'Cash Account', value: '1000001' },
                      { label: 'Bank Account', value: '1000002' },
                    ]}
                  />
                </div>
                <div className="grid   justify-end items-start   ">
                  <div className="mb-2 col-span-2 text-sm text-right font-bold">
                    Amount:
                  </div>

                  {/* <AmountBox form={form} name='amount' /> */}

                  <FormInputField
                    form={form}
                    name="amount"
                    type="number"
                    className=""
                    label="Amount"
                    noLabel
                    gapClass="col-span-2 grid grid-rows-1! grid-cols-1 justify-end items-end gap-4 pl-4"
                  />
                </div>
              </div>
              <div className="grid   justify-end items-start  col-span-2 ">
                <Button
                  type="button"
                  variant={'outline'}
                  onClick={() => handleSubmit(form.getValues())}
                  className={cn(
                    'btn btn-primary w-full border-2 border-blue-600',
                    isPending || amount === 0 || isLimiting > 0
                      ? 'cursor-not-allowed opacity-70'
                      : 'hover:bg-blue-600 hover:text-white',
                    'focus:bg-gray-800 focus:text-gray-50',
                  )}
                  disabled={isPending || amount === 0 || isLimiting > 0}
                >
                  {isPending || isLimiting > 0 ? (
                    <SkeletonButton />
                  ) : (
                    'Save Receipt'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </Suspense>
  )
}

type DateBoxProps = {
  form: UseFormReturn<FreightReceiptForm>

  name: keyof FreightReceiptForm
}

const DateBox = (props: DateBoxProps) => {
  const { form, name } = props
  const [displayValue, setDisplayValue] = useState<string | null>('')

  const parseAndFormatDate = (input: string): Date | null => {
    if (!input) return null

    const now = new Date()
    const parts = input.split(/[./-]/).map((p) => p.trim())

    const day = Number(parts[0])
    const month = parts[1] ? Number(parts[1]) - 1 : now.getMonth() // month index
    const year =
      parts[2] && parts[2].length === 2
        ? 2000 + Number(parts[2])
        : parts[2]
          ? Number(parts[2])
          : now.getFullYear()

    if (isNaN(day) || day < 1 || day > 31) return null
    if (isNaN(month) || month < 0 || month > 11) return null
    if (isNaN(year) || year < 1000) return null

    return new Date(year, month, day)
  }
  const parseDate = () => {
    const parsed = parseAndFormatDate(displayValue!)
    if (parsed) {
      form.setValue(name, parsed, { shouldValidate: true, shouldDirty: true })
      const formatted = parsed.toLocaleDateString('en-GB').replace(/\//g, '-') // DD/MM/YYYY
      setDisplayValue(formatted)
      const DBFormat = `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, '0')}-${parsed.getDate().toString().padStart(2, '0')}`
      form.setValue(name, DBFormat, { shouldValidate: true, shouldDirty: true })
    }
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      parseDate()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setDisplayValue('')
      form.setValue(name, undefined, {
        shouldValidate: true,
        shouldDirty: true,
      })
      return
    }
    setDisplayValue(e.target.value)
  }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault()

    parseDate()
    // if (parsed) {
    //     form.setValue(name, parsed, { shouldValidate: true, shouldDirty: true });
    //     const formatted = parsed.toLocaleDateString("en-GB").replace(/\//g, '-'); // DD/MM/YYYY
    //     setDisplayValue(formatted);
    //     const DBFormat = `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, '0')}-${parsed.getDate().toString().padStart(2, '0')}`
    //     form.setValue(name, DBFormat, { shouldValidate: true, shouldDirty: true });
    // }
  }

  useEffect(() => {
    const formValue = form.watch(name)
    if (formValue) {
      let parsed: Date

      if (typeof formValue === 'string' || typeof formValue === 'number') {
        parsed = new Date(formValue)
      } else if (formValue instanceof Date) {
        parsed = formValue
      } else {
        return // not a valid date type
      }

      if (!isNaN(parsed.getTime())) {
        const formatted = parsed.toLocaleDateString('en-GB').replace(/\//g, '-')
        setDisplayValue(formatted)
      }
    } else {
      setDisplayValue('')
    }
    parseDate()
  }, [form.watch(name)])

  return (
    <>
      {/* {form.watch(name)} {displayValue} */}
      <Input
        type="text"
        placeholder="__-__-____"
        value={displayValue!}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <span className="hidden">
        <FormInputField
          type="date"
          form={form}
          label=""
          noLabel
          gapClass="grid-cols-[1fr] gap-0  "
          name={name}
        />
      </span>
    </>
  )
}
