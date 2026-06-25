

// export const account_groups = Array.from({ length: 20 }, () => {
//   const name = faker.person.fullName()
//   const code = faker.string.alphanumeric({ length: 5 })
//   return {
//     id: faker.string.uuid(),
//     name,
//     code,
//     description: faker.lorem.sentence(),
//     status: faker.helpers.arrayElement([
//       'active',
//       'inactive',
//     ]),
//     accounting_effect: faker.helpers.arrayElement(['debit', 'credit', null])

import { fetchFreightService } from "./api"



//   }
// })

export const day_books = async () => {
  const data = await fetchFreightService("stock_in_hand")
  if (!data) {
    return []
  }
  return data.data
}