import FormInputField from '@/components/form-input-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconCheck, IconHistory, IconLoader2, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { OpeningStockVoucherForm } from '../../data/schema'
import type { ClosingInfo } from '../contracts'

type PosHeaderProps = {
  mainForm: UseFormReturn<OpeningStockVoucherForm>
  isFetchingClosing?: boolean
  onFetchPreviousClosing?: () => void
  closingInfo?: ClosingInfo | null
  onClearClosing?: () => void
}

const PosHeader = ({
  mainForm: form,
  isFetchingClosing = false,
  onFetchPreviousClosing,
  closingInfo = null,
  onClearClosing,
}: PosHeaderProps) => {
  const voucherDate = form.watch('voucherDate')

  const dayName = voucherDate
    ? new Date(voucherDate).toLocaleDateString('en-US', { weekday: 'long' })
    : ''

  return (
    <div className="grid grid-rows-1">
      <div className="grid grid-cols-[350px_1fr]">
        <div className="space-y-0">
          <div className="grid grid-cols-[170px_200px] gap-2">
            <div className="bg-teal-700 text-gray-100 px-2 py-0.5 shadow-md text-sm">
              Opening Stock
            </div>
            <div>
              no:
              <span className="uppercase font-bold text-lg text-teal-800 underline underline-offset-2 decoration-1 pl-2 space-r-1">
                {form.getValues('voucherNo') ?? 'new'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-[300px_300px] gap-6 pt-2">
            <div className="grid grid-cols-1">
              <FormInputField
                form={form}
                tabIndex={0}
                gapClass={'grid grid-cols-[90px_auto] gap-4'}
                type="text"
                name="referenceNo"
                label="Reference No."
              />
            </div>
            <div className="grid grid-cols-[110px_150px]">
              <Label>Reference Date:</Label>
              <DateBox tabIndex={1} form={form} name="referenceDate" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-start justify-end gap-x-4 gap-y-2 pr-4">
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5">
              <div className="text-right text-base leading-snug text-slate-500">
                <span className="font-semibold text-emerald-600">IN</span> =
                Opening stock quantities
              </div>
              {onFetchPreviousClosing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={onFetchPreviousClosing}
                  disabled={isFetchingClosing}
                >
                  {isFetchingClosing ? (
                    <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <IconHistory className="h-3.5 w-3.5" />
                  )}
                  Fetch Previous Year Closing Stock
                </Button>
              )}
            </div>
            {closingInfo && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                  <IconCheck className="h-3.5 w-3.5 shrink-0" />
                  Loaded {closingInfo.itemCount} item(s) from{' '}
                  {closingInfo.fyName}{' '}
                  {closingInfo.source === 'running'
                    ? 'running balance'
                    : 'closing'}
                  {closingInfo.voucherNo ? ` (${closingInfo.voucherNo})` : ''}
                </span>
                {onClearClosing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground"
                    onClick={onClearClosing}
                  >
                    <IconX className="h-3.5 w-3.5" />
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>
          <div title="Opening Stock is always dated on the first day of the fiscal year">
            <DateBox
              tabIndex={2}
              form={form}
              name="voucherDate"
              disabled
              className="[&_input]:text-base"
            />
            <div className="text-right text-base font-bold">{dayName}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PosHeader

type DateBoxProps = {
  form: UseFormReturn<OpeningStockVoucherForm>
  name: 'referenceDate' | 'voucherDate'
  tabIndex?: number
  className?: string
  disabled?: boolean
}

const DateBox = (props: DateBoxProps) => {
  const { form, name, className, disabled = false } = props
  const [displayValue, setDisplayValue] = useState<string | null>('')

  const parseAndFormatDate = (input: string): Date | null => {
    if (!input) return null

    const now = new Date()
    const parts = input.split(/[./-]/).map((p) => p.trim())

    let day = Number(parts[0])
    let month = parts[1] ? Number(parts[1]) - 1 : now.getMonth()
    let year =
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
      const formatted = parsed.toLocaleDateString('en-GB').replace(/\//g, '-')
      setDisplayValue(formatted)
      const DBFormat = `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, '0')}-${parsed.getDate().toString().padStart(2, '0')}`
      form.setValue(name, DBFormat as never, {
        shouldValidate: true,
        shouldDirty: true,
      })
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
      form.setValue(name, null as never, {
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
        return
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
      <Input
        type="text"
        placeholder="__-__-____"
        value={displayValue!}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
        className={className}
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
