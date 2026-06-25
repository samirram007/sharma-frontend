'use client'


import type { User } from '../data/schema'
import { FormAction } from './form-action'


interface Props {
    currentRow?: User
}

export function ActionPages({ currentRow }: Props) {

    return <FormAction currentRow={currentRow} />

}
