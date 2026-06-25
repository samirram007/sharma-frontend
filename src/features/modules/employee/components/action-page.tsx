'use client'


import type { Employee } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: Employee
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
