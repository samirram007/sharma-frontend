'use client'


import type { StorageUnit } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: StorageUnit
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
