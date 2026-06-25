'use client'


import type { StockItem } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: StockItem
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
