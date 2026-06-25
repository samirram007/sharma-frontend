'use client'


import type { Distributor } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: Distributor
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
