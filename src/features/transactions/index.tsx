import {
  IconLayoutColumns,
  IconLayoutGrid,
  IconSearch,
  IconUser,
  IconUserCog,
  IconX,
} from '@tabler/icons-react'

import Icon from '@/components/icon'
import { Separator } from '@/components/ui/separator'
import { lowerCase } from '@/utils/removeEmptyStrings'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  voucherCategoryViewListSchema,
  type VoucherCategoryView,
} from '../modules/voucher_category/data/schema'
import type { VoucherType } from '../modules/voucher_type/data/schema'

const gradientTones = [
  {
    chip: 'from-blue-500 to-indigo-600 text-white shadow-[0_10px_20px_-12px_rgba(37,99,235,0.8)]',
    card: 'hover:border-blue-300/70 hover:bg-blue-50/40 dark:hover:border-blue-700/60 dark:hover:bg-blue-950/20',
  },
  {
    chip: 'from-rose-500 to-pink-600 text-white shadow-[0_10px_20px_-12px_rgba(225,29,72,0.8)]',
    card: 'hover:border-rose-300/70 hover:bg-rose-50/40 dark:hover:border-rose-700/60 dark:hover:bg-rose-950/20',
  },
  {
    chip: 'from-emerald-500 to-teal-600 text-white shadow-[0_10px_20px_-12px_rgba(5,150,105,0.8)]',
    card: 'hover:border-emerald-300/70 hover:bg-emerald-50/40 dark:hover:border-emerald-700/60 dark:hover:bg-emerald-950/20',
  },
  {
    chip: 'from-violet-500 to-purple-600 text-white shadow-[0_10px_20px_-12px_rgba(124,58,237,0.8)]',
    card: 'hover:border-violet-300/70 hover:bg-violet-50/40 dark:hover:border-violet-700/60 dark:hover:bg-violet-950/20',
  },
  {
    chip: 'from-amber-500 to-orange-600 text-white shadow-[0_10px_20px_-12px_rgba(217,119,6,0.8)]',
    card: 'hover:border-amber-300/70 hover:bg-amber-50/40 dark:hover:border-amber-700/60 dark:hover:bg-amber-950/20',
  },
  {
    chip: 'from-cyan-500 to-sky-600 text-white shadow-[0_10px_20px_-12px_rgba(2,132,199,0.8)]',
    card: 'hover:border-cyan-300/70 hover:bg-cyan-50/40 dark:hover:border-cyan-700/60 dark:hover:bg-cyan-950/20',
  },
]

const voucherIconOverrides = new Map<string, string>([
  ['contra', 'FaExchangeAlt'],
  ['payment', 'FaMoneyBillWave'],
  ['receipt', 'FaReceipt'],
  ['journal', 'FaBook'],
  ['purchase', 'FaCartArrowDown'],
  ['sales', 'FaCartPlus'],
  ['debit_note', 'FaFileInvoice'],
  ['credit_note', 'FaFileInvoiceDollar'],
  ['reversing_journal', 'FaUndo'],
  ['reverse_journal', 'FaUndo'],
  ['memo', 'FaStickyNote'],
  ['delivery_note', 'FaTruck'],
  ['receipt_note', 'FaFileImport'],
  ['rejection_in', 'FaTimesCircle'],
  ['rejection_out', 'FaBan'],
  ['transfer_voucher', 'FaExchangeAlt'],
  ['manufacturing_journal', 'FaIndustry'],
  ['conversion_journal', 'FaExchangeAlt'],
  ['physical_stock', 'FaClipboardCheck'],
  ['purchase_order', 'FaShoppingBag'],
  ['sales_order', 'FaChartLine'],
])

const getToneByName = (name: string) => {
  const hash = name
    .toLowerCase()
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return gradientTones[hash % gradientTones.length]
}

interface TransactionProps {
  data: VoucherCategoryView
}
export default function Transactions({ data }: TransactionProps) {
  const voucherCategories = voucherCategoryViewListSchema.parse(data ?? [])
  const [viewMode, setViewMode] = useState<'grid' | 'column'>('grid')
  const [searchText, setSearchText] = useState('')
  const searchQuery = searchText.trim().toLowerCase()

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return voucherCategories

    return voucherCategories
      .map((category) => {
        const filteredTypes = category.voucherTypes?.filter((voucherType) => {
          const haystack =
            `${voucherType.name} ${voucherType.description} ${category.name}`.toLowerCase()
          return haystack.includes(searchQuery)
        })

        return {
          ...category,
          voucherTypes: filteredTypes,
        }
      })
      .filter((category) => (category.voucherTypes?.length ?? 0) > 0)
  }, [voucherCategories, searchQuery])

  const hasResults = filteredCategories.length > 0
  const matchedItems = useMemo(
    () =>
      filteredCategories.flatMap((category) =>
        (category.voucherTypes ?? []).map((voucherType) => ({
          categoryName: category.name,
          voucherType,
          moduleLink: category.moduleLink ?? '',
        })),
      ),
    [filteredCategories],
  )

  return (
    <div className="w-full px-1 pb-6 sm:px-2 lg:px-3">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-0 flex-1 md:max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <IconSearch size={14} className="text-slate-400" />
          </span>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search voucher items..."
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 pl-9 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/[0.07] dark:bg-secondary dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-600 dark:focus:ring-blue-900/40"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <IconX size={14} />
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-white/[0.07] dark:bg-secondary">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <IconLayoutGrid size={13} />
            Current View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('column')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'column'
                ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <IconLayoutColumns size={13} />
            Column View
          </button>
        </div>
      </div>

      {searchQuery && (
        <div className="mb-3 text-xs text-slate-600 dark:text-slate-400">
          {hasResults
            ? `Found matches in ${filteredCategories.length} group${filteredCategories.length > 1 ? 's' : ''}.`
            : 'No matching voucher items found.'}
        </div>
      )}

      {searchQuery && hasResults && (
        <div
          className={
            viewMode === 'column'
              ? 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'
              : 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
          }
        >
          {matchedItems.map((item) => (
            <VoucherTypeTablet
              key={`${item.categoryName}-${item.voucherType.id}`}
              voucherType={item.voucherType}
              moduleLink={item.moduleLink}
              categoryLabel={item.categoryName}
              isHighlighted
            />
          ))}
        </div>
      )}

      {!searchQuery && filteredCategories && hasResults && (
        <div
          className={
            viewMode === 'column'
              ? 'columns-1 gap-4 md:columns-2 xl:columns-3 2xl:columns-4'
              : 'space-y-2'
          }
        >
          {filteredCategories.map((voucherCategory) => (
            <section
              key={voucherCategory.id}
              className={
                viewMode === 'column'
                  ? 'mb-4 inline-block w-full break-inside-avoid space-y-3 rounded-xl border border-slate-200/70 bg-white/80 p-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'
                  : 'w-full space-y-4 pt-3'
              }
            >
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                {voucherCategory.name}
              </h2>
              <Separator />
              <div
                className={
                  viewMode === 'column'
                    ? 'grid grid-cols-1 gap-3'
                    : 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                }
              >
                {voucherCategory.voucherTypes &&
                  voucherCategory.voucherTypes.map((voucherType) => (
                    <VoucherTypeTablet
                      key={voucherType.id}
                      voucherType={voucherType}
                      moduleLink={voucherCategory.moduleLink ?? ''}
                    />
                  ))}
              </div>
              {viewMode !== 'column' ? <Separator /> : null}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
interface VoucherTypeTabletProps {
  voucherType: VoucherType
  moduleLink: string
  categoryLabel?: string
  isHighlighted?: boolean
}

// const moduleLinkItemSchema = z.object({
//     title: z.string(),
//     href: z.string().url(),
// });

// const moduleLinkSchema = z.array(moduleLinkItemSchema).optional().transform(val => val ?? []);

const VoucherTypeTablet = ({
  voucherType,
  moduleLink,
  categoryLabel,
  isHighlighted = false,
}: VoucherTypeTabletProps) => {
  const router = useLocation()
  const navigate = useNavigate()
  const handleClick = () => {
    const mappedLink = moduleLinkCollection.find(
      (item) => item.title === voucherType.name,
    )?.href
    const autoLink = `/${router.pathname}/${lowerCase(voucherType.name.replace(' ', '_'))}`
    const targetLink =
      mappedLink || (moduleLink.startsWith('/') ? moduleLink : autoLink)
    navigate({ to: targetLink })
  }

  const tone = getToneByName(voucherType.name)
  const voucherTypeKey = lowerCase(voucherType.name).replace(/\s+/g, '_')
  const iconName = voucherIconOverrides.get(voucherTypeKey) ?? voucherType.icon

  return (
    <button
      type="button"
      className={`group text-left rounded-xl border border-slate-200/80 bg-white/90 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(15,23,42,0.45)] dark:border-white/[0.08] dark:bg-white/[0.06] ${tone.card} ${
        isHighlighted
          ? 'ring-1 ring-blue-300/70 shadow-[0_10px_24px_-16px_rgba(59,130,246,0.55)] dark:ring-blue-700/60'
          : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`inline-flex rounded-lg bg-linear-to-br p-2 ${tone.chip}`}
        >
          <Icon name={iconName ?? ''} size={20} className="text-current" />
        </div>
        <div className="min-w-0">
          {categoryLabel ? (
            <div className="mb-1 inline-flex rounded-full border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600 dark:border-white/[0.08] dark:bg-secondary/70 dark:text-slate-300">
              {categoryLabel}
            </div>
          ) : null}
          <div className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {voucherType.name}
          </div>
          <div className="mt-0.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {voucherType.description}
          </div>
        </div>
      </div>
    </button>
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
