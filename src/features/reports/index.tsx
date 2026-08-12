import { IconUser, IconUserCog } from '@tabler/icons-react'

import Icon from '@/components/icon'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { lowerCase } from '@/utils/removeEmptyStrings'
import { useLocation, useNavigate } from '@tanstack/react-router'
import {
  voucherCategoryViewListSchema,
  type VoucherCategoryView,
} from '../modules/voucher_category/data/schema'
import type { VoucherType } from '../modules/voucher_type/data/schema'

interface TransactionProps {
  data: VoucherCategoryView
}
export default function Transactions({ data }: TransactionProps) {
  const voucherCategories = voucherCategoryViewListSchema.parse(data ?? [])

  return (
    <div className="w-full">
      {voucherCategories &&
        voucherCategories.map((voucherCategory) => (
          <div key={voucherCategory.id} className="w-full flex flex-col gap-6">
            <div className="text-4xl text-shadow-lg pt-4">
              {voucherCategory.name}
            </div>
            <Separator />
            <div className="grid grid-cols-4 gap-6">
              {voucherCategory.voucherTypes &&
                voucherCategory.voucherTypes.map((voucherType) => (
                  <VoucherTypeTablet
                    key={voucherType.id}
                    voucherType={voucherType}
                    moduleLink={voucherCategory.moduleLink ?? ''}
                  />
                ))}
            </div>
            <Separator />
          </div>
        ))}
    </div>
  )
}
interface VoucherTypeTabletProps {
  voucherType: VoucherType
  moduleLink: string
}

// const moduleLinkItemSchema = z.object({
//     title: z.string(),
//     href: z.string().url(),
// });

// const moduleLinkSchema = z.array(moduleLinkItemSchema).optional().transform(val => val ?? []);

const VoucherTypeTablet = ({
  voucherType,
  moduleLink,
}: VoucherTypeTabletProps) => {
  const router = useLocation()
  const navigate = useNavigate()
  const handleClick = () => {
    const link =
      moduleLinkCollection.find((item) => item.title === voucherType.name)
        ?.href ?? moduleLink
    alert(link)

    navigate({
      to: `/${router.pathname}/${lowerCase(voucherType.name.replace(' ', '_'))}`,
    })
  }

  return (
    <Label
      className="text-lg tablet rounded-2xl border-2 p-4 flex items-start "
      onClick={handleClick}
    >
      <div className=" ">
        <Icon
          name={voucherType.icon ?? ''}
          size={36}
          className="text-amber-700/70"
        />
      </div>
      <div>
        <div className="text-2xl"> {voucherType.name}</div>
        <div className="text-sm"> {voucherType.description}</div>
      </div>
    </Label>
  )
}

const moduleLinkCollection = [
  {
    title: 'Employee',
    href: '/masters/payroll/employee',
  },
  {
    title: 'Department',
    icon: <IconUser size={18} />,
    href: '/masters/payroll/department',
  },
  {
    title: 'Receipt Note',
    icon: <IconUser size={18} />,
    href: '/transactions/voucher/receipt_note',
  },
  {
    title: 'Grade',
    icon: <IconUser size={18} />,
    href: '/masters/payroll/grade',
  },
  {
    title: 'Bank Master',
    icon: <IconUserCog />,
    href: '/masters/payroll/bank_master',
  },
  {
    title: 'Salary',
    icon: <IconUserCog />,
    href: '/masters/payroll/salary',
  },
  {
    title: 'Leave Types',
    icon: <IconUserCog />,
    href: '/masters/payroll/leave_types',
  },
  {
    title: 'Holiday List',
    icon: <IconUserCog />,
    href: '/masters/payroll/holiday_list',
  },
  {
    title: 'Shifts',
    icon: <IconUserCog />,
    href: '/masters/payroll/shifts',
  },
]
