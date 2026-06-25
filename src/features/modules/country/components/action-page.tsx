'use client'


import type { Country } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: Country
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
