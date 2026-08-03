import { Form } from '@/components/ui/form'
import { useFocusArea } from '@/core/hooks/useFocusArea'
import { useRestrictFocusToRef } from '@/core/hooks/useRestrictFocusToRef'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { usePos } from '../../contexts/pos-context'
import ManufacturingJournalDefaultValues from '../data/data'
import {
  ManufacturingJournalFormSchema,
  type ManufacturingJournalVoucherForm,
} from '../data/schema'
import PosBody from './components/pos-body'
import PosFooter from './components/pos-footer'
import PosHeader from './components/pos-header'
import type { ManufacturingJournalProps } from './contracts'

const Pos = ({ currentRow }: ManufacturingJournalProps) => {
  const areaRef = useRef<HTMLDivElement>(null)
  const { setMovementType, setPerRowMovementType } = usePos()
  useFocusArea(areaRef as React.RefObject<HTMLElement>)
  useRestrictFocusToRef(areaRef as React.RefObject<HTMLElement>)
  const isEdit = !!currentRow?.id
  const data = { ...currentRow }
  const mainForm = useForm<ManufacturingJournalVoucherForm>({
    resolver: zodResolver(
      ManufacturingJournalFormSchema,
    ) as Resolver<ManufacturingJournalVoucherForm>,
    defaultValues: isEdit
      ? { ...data, isEdit: true }
      : { ...ManufacturingJournalDefaultValues, isEdit: false },
  })
  useEffect(() => {
    // New lines default to production (IN); users toggle raw materials to OUT per line
    setMovementType?.('in')
    setPerRowMovementType?.(true)
  }, [setMovementType, setPerRowMovementType])

  return (
    <>
      <div
        ref={areaRef}
        className="voucher-entry w-full grid grid-rows-[1fr_100px]
             h-[calc(100dvh-170px)]  "
      >
        <Form {...mainForm}>
          <div className="max-h-full grid grid-rows-[150px_1fr] overflow-hidden">
            <PosHeader mainForm={mainForm} />
            <PosBody mainForm={mainForm} />
          </div>
          <PosFooter mainForm={mainForm} />
        </Form>
      </div>
    </>
  )
}

export default Pos
