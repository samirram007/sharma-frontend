'use client'


import type { Company } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: Company
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
