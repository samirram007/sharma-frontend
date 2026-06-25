

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

import { fetchAppModuleService } from "./api"

//   }
// })

export const app_modules = async () => {
  const data = await fetchAppModuleService()
  if (!data) {
    return []
  }
  return data.data
}