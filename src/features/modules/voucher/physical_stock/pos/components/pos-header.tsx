import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import GodownSheetSelect from './godown-sheet-select'

import type {
  PhysicalStockCountForm,
  PhysicalStockCountStatus,
} from '../../data/schema'

type PosHeaderProps = {
  form: UseFormReturn<PhysicalStockCountForm>
  godowns: Array<{ id: number; name: string; code?: string | null }>
  fiscalYearName?: string
  status: PhysicalStockCountStatus
}

const statusStyles: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800 border-amber-300',
  verified: 'bg-blue-100 text-blue-800 border-blue-300',
  adjusted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
}

const PosHeader = ({
  form,
  godowns,
  fiscalYearName,
  status,
}: PosHeaderProps) => {
  const countId = form.watch('id')

  return (
    <div className="border-b px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-lime-600 text-gray-100 px-2 py-0.5 shadow-md text-sm">
            Physical Stock
          </span>
          <span className="text-sm">
            no:{' '}
            <span className="uppercase font-bold text-teal-800">
              {countId ? `#${countId}` : 'NEW'}
            </span>
          </span>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            statusStyles[status] ?? ''
          }`}
        >
          {status}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-[280px_200px_1fr] items-end gap-4">
        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
          <Label>Godown:</Label>
          <GodownSheetSelect form={form} godowns={godowns} />
        </div>
        <div className="grid grid-cols-[90px_110px] items-center gap-2">
          <Label>Count Date:</Label>
          <DateBox form={form} name="countDate" />
        </div>
        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
          <Label>Fiscal Year:</Label>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {fiscalYearName ?? '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PosHeader

type DateBoxProps = {
  form: UseFormReturn<PhysicalStockCountForm>
  name: 'countDate'
  tabIndex?: number
}

const DateBox = (props: DateBoxProps) => {
  const { form, name } = props
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
    <Input
      type="text"
      placeholder="__-__-____"
      value={displayValue!}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  )
}
