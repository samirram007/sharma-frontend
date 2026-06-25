import { getData } from "@/utils/dataClient"

// const API_PATH = "/parties"
export async function fetchPartyLedgerService(module: string) {
    return await getData(`${module}`)
}
export async function fetchPartyLedgerByIdService(module: string, id: number) {
    return await getData(`${module}/${id}`)
}

