import { getData } from "@/utils/dataClient";

const API_PATH = "/distributor_books"
async function fetchDistributorBookService() {

    return await getData(`${API_PATH}`)
}
async function fetchDistributorBookByIdService(id: number) {

    return await getData(`${API_PATH}/${id}`)
}

export { fetchDistributorBookService, fetchDistributorBookByIdService };