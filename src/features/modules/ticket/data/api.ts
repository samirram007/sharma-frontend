import { getData, postData, putData } from '@/utils/dataClient'

const API_PATH = '/tickets'

export async function fetchTicketService() {
  return await getData(API_PATH)
}

export async function fetchTicketByIdService(id: number) {
  return await getData(`${API_PATH}/${id}`)
}

export async function storeTicketService(payload: any) {
  return await postData(API_PATH, payload)
}

export async function updateTicketService(payload: any) {
  return await putData(`${API_PATH}/${payload.id}`, payload)
}

export async function addTicketResponseService(
  ticketId: number,
  payload: { message: string },
) {
  return await postData(`${API_PATH}/${ticketId}/responses`, payload)
}

export async function updateTicketStatusService(
  ticketId: number,
  status: string,
) {
  const axiosClient = (await import('@/utils/axios-client')).default
  const response = await axiosClient.patch(`${API_PATH}/${ticketId}/status`, {
    status,
  })
  return response.data
}
