'use client'


import type { Transporter } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: Transporter
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
