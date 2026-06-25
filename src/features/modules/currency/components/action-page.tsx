'use client'


import type { Currency } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: Currency
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
