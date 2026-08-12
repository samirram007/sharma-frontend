import {
  IconBook2,
  IconBookmark,
  IconCategory,
  IconReceipt,
  IconSitemap,
  IconTags,
} from '@tabler/icons-react'
import { Outlet } from '@tanstack/react-router'

import SidebarInner from '@/features/global/components/sidebar-inner'
import { Main } from '@/layouts/components/main'
import { useAccount } from './contexts/account-context'

export default function Accounts() {
  const { sideBarOpen } = useAccount()
  return (
    <>
      <Main fixed>
        <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
          {sideBarOpen && (
            <SidebarInner
              title="Accounts"
              description="Manage ledgers, account groups, voucher types and financial classifications."
              items={sidebarNavItems}
            />
          )}
          <div className="flex min-w-0 w-full overflow-y-auto p-1">
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}

const sidebarNavItems = [
  {
    title: 'Account Nature',
    description:
      'Define root-level nature types used to classify all ledger accounts.',
    visible: true,
    icon: <IconBookmark size={22} stroke={1.9} />,
    href: '/masters/accounts/account_nature',
  },
  {
    title: 'Account Group',
    description:
      'Organise ledger accounts into structured groups for financial reporting.',
    visible: true,
    icon: <IconSitemap size={22} stroke={1.9} />,
    href: '/masters/accounts/account_group',
  },
  {
    title: 'Account Ledger',
    description: 'Create and maintain individual financial ledger records.',
    visible: true,
    icon: <IconBook2 size={22} stroke={1.9} />,
    href: '/masters/accounts/account_ledger',
  },
  {
    title: 'Voucher Type',
    description:
      'Configure voucher types that drive transaction and journal entry flows.',
    visible: true,
    icon: <IconReceipt size={22} stroke={1.9} />,
    href: '/masters/accounts/voucher_type',
  },
  {
    title: 'Voucher Category',
    description:
      'Group voucher types into broader operational workflow categories.',
    visible: true,
    icon: <IconCategory size={22} stroke={1.9} />,
    href: '/masters/accounts/voucher_category',
  },
  {
    title: 'Voucher Classification',
    description:
      'Apply classification labels to segment and filter vouchers in reports.',
    visible: true,
    icon: <IconTags size={22} stroke={1.9} />,
    href: '/masters/accounts/voucher_classification',
  },
]
