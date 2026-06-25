'use client'




import type { State } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: State
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
