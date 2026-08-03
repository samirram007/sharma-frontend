import { Form } from '@/components/ui/form'
import { useFocusArea } from '@/core/hooks/useFocusArea'
import { useRestrictFocusToRef } from '@/core/hooks/useRestrictFocusToRef'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { usePos } from '../../contexts/pos-context'
import TransferVoucherDefaultValues from '../data/data'
import {
  TransferVoucherFormSchema,
  type TransferVoucherVoucherForm,
} from '../data/schema'
import PosBody from './components/pos-body'
import PosFooter from './components/pos-footer'
import PosHeader from './components/pos-header'
import type { TransferVoucherProps } from './contracts'

const Pos = ({ currentRow }: TransferVoucherProps) => {
  const areaRef = useRef<HTMLDivElement>(null)
  const { setMovementType, setPerGodownRowMovementType } = usePos()
  useFocusArea(areaRef as React.RefObject<HTMLElement>)
  useRestrictFocusToRef(areaRef as React.RefObject<HTMLElement>)
  const isEdit = !!currentRow?.id
  const data = { ...currentRow }
  const mainForm = useForm<TransferVoucherVoucherForm>({
    resolver: zodResolver(
      TransferVoucherFormSchema,
    ) as Resolver<TransferVoucherVoucherForm>,
    defaultValues: isEdit
      ? { ...data, isEdit: true }
      : { ...TransferVoucherDefaultValues, isEdit: false },
  })
  useEffect(() => {
    // Transfers move stock OUT of a source godown and IN to a destination godown.
    // Each godown row carries its own movement type.
    setMovementType?.('in')
    setPerGodownRowMovementType?.(true)
  }, [setMovementType, setPerGodownRowMovementType])

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
