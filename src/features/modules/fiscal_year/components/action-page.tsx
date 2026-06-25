'use client'


import type { FiscalYear } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: FiscalYear
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
