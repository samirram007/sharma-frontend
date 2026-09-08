import { getData } from '@/utils/dataClient'

const API_PATH = '/freights_godown_wise'

async function fetchFreightGodownWiseService() {
  return await getData(API_PATH)
}

export { fetchFreightGodownWiseService }
