'use client'


import type { Supplier } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: Supplier
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
