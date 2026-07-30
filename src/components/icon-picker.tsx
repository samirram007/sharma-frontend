'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { resolveIcon } from '@/features/modules/menu/data/menu-icon-map'
import { cn } from '@/lib/utils'
import {
  IconChecklist,
  IconLayoutDashboard,
  IconMessages,
  IconPackages,
  IconUsers,
} from '@tabler/icons-react'
import { CheckIcon, ChevronsUpDownIcon, Package } from 'lucide-react'
import {
  FaBan,
  FaBolt,
  FaBook,
  FaCalendarAlt,
  FaCartArrowDown,
  FaCartPlus,
  FaChartLine,
  FaClipboardCheck,
  FaClock,
  FaCoins,
  FaCreditCard,
  FaExchangeAlt,
  FaFileExport,
  FaFileImport,
  FaFileInvoice,
  FaFileInvoiceDollar,
  FaGift,
  FaHandHolding,
  FaHandHoldingUsd,
  FaHome,
  FaIndustry,
  FaMoneyBill,
  FaMoneyBillWave,
  FaMoneyCheck,
  FaPercentage,
  FaPlusSquare,
  FaReceipt,
  FaRegCreditCard,
  FaRegMoneyBillAlt,
  FaShieldAlt,
  FaShoppingBag,
  FaStickyNote,
  FaTimesCircle,
  FaTrash,
  FaTruck,
  FaUndo,
  FaUsersCog,
  FaUserShield,
} from 'react-icons/fa'
import type { UseFormReturn } from 'react-hook-form'
import * as React from 'react'

// ── Icon definitions ────────────────────────────────────────────────────────
// Icons are grouped by source library for visual organization.

interface IconEntry {
  name: string
  component: React.ElementType
  group: string
}

/**
 * Build the icon catalog from all available icon sources.
 * Supports both the resolveIcon() map (Lucide + Tabler) and
 * the IconBag from the Icon component (Tabler + FontAwesome).
 */
function buildIconCatalog(): IconEntry[] {
  const catalog: IconEntry[] = []

  // ── Lucide icons (from resolveIcon / menu-icon-map) ─────────────
  const lucideIcons: [string, React.ElementType][] = [
    ['LayoutDashboard', Package],
    ['Book', Package],
    ['ChartBar', Package],
    ['ChartNoAxesColumn', Package],
    ['TrendingUp', Package],
    ['List', Package],
    ['ListChecks', Package],
    ['ListOrdered', Package],
    ['Building2', Package],
    ['Landmark', Package],
    ['Warehouse', Package],
    ['Home', Package],
    ['Users', Package],
    ['User', Package],
    ['HandCoins', Package],
    ['PiggyBank', Package],
    ['Receipt', Package],
    ['ReceiptText', Package],
    ['Package', Package],
    ['PackageOpen', Package],
    ['Truck', Package],
    ['ShoppingBag', Package],
    ['ShoppingCart', Package],
    ['MessageSquare', Package],
    ['MessagesSquare', Package],
    ['ClipboardList', Package],
    ['ClipboardPen', Package],
    ['ClipboardType', Package],
    ['FileText', Package],
    ['Notebook', Package],
    ['NotebookTabs', Package],
    ['Map', Package],
    ['Route', Package],
    ['CheckCheck', Package],
    ['CheckCircle', Package],
    ['Star', Package],
    ['Settings', Package],
    ['Radar', Package],
    ['MoreHorizontal', Package],
    ['Globe', Package],
    ['Archive', Package],
  ]

  for (const [name] of lucideIcons) {
    catalog.push({
      name,
      component: resolveIcon(name),
      group: 'Lucide',
    })
  }

  // ── Tabler icons (from resolveIcon with explicit keys) ──────────
  const tablerResolveIcons: [string, React.ElementType][] = [
    ['BuildingWarehouse', Package],
    ['Coin', Package],
    ['DoorEnter', Package],
    ['TruckDelivery', Package],
    ['Route2', Package],
    ['LocationBolt', Package],
    ['Report', Package],
    ['MichelinStar', Package],
    ['PremiumRights', Package],
    ['PaperBag', Package],
    ['Apps', Package],
    ['Radar2', Package],
    ['FileInvoice', Package],
    ['Help', Package],
    ['MapPin', Package],
    ['Scale', Package],
    ['UserCheck', Package],
    ['Checklist', Package],
    ['ListDetails', Package],
    ['Tool', Package],
    ['Notification', Package],
    ['BrowserCheck', Package],
    ['PaintBucket', Package],
  ]

  for (const [name] of tablerResolveIcons) {
    catalog.push({
      name,
      component: resolveIcon(name),
      group: 'Tabler',
    })
  }

  // ── Tabler icons (from IconBag / icon.tsx) ──────────────────────
  const tablerIconBag: [string, React.ElementType][] = [
    ['IconLayoutDashboard', IconLayoutDashboard],
    ['IconChecklist', IconChecklist],
    ['IconPackages', IconPackages],
    ['IconMessages', IconMessages],
    ['IconUsers', IconUsers],
  ]

  for (const [name, component] of tablerIconBag) {
    catalog.push({ name, component, group: 'Tabler' })
  }

  // ── FontAwesome icons (from IconBag / icon.tsx) ─────────────────
  const faIcons: [string, React.ElementType][] = [
    ['FaMoneyBill', FaMoneyBill],
    ['FaMoneyCheck', FaMoneyCheck],
    ['FaRegMoneyBillAlt', FaRegMoneyBillAlt],
    ['FaRegCreditCard', FaRegCreditCard],
    ['FaCreditCard', FaCreditCard],
    ['FaFileInvoiceDollar', FaFileInvoiceDollar],
    ['FaFileInvoice', FaFileInvoice],
    ['FaBan', FaBan],
    ['FaBolt', FaBolt],
    ['FaBook', FaBook],
    ['FaCalendarAlt', FaCalendarAlt],
    ['FaCartArrowDown', FaCartArrowDown],
    ['FaCartPlus', FaCartPlus],
    ['FaChartLine', FaChartLine],
    ['FaClipboardCheck', FaClipboardCheck],
    ['FaClock', FaClock],
    ['FaCoins', FaCoins],
    ['FaExchangeAlt', FaExchangeAlt],
    ['FaFileExport', FaFileExport],
    ['FaFileImport', FaFileImport],
    ['FaGift', FaGift],
    ['FaHandHolding', FaHandHolding],
    ['FaHandHoldingUsd', FaHandHoldingUsd],
    ['FaHome', FaHome],
    ['FaIndustry', FaIndustry],
    ['FaMoneyBillWave', FaMoneyBillWave],
    ['FaPercentage', FaPercentage],
    ['FaPlusSquare', FaPlusSquare],
    ['FaReceipt', FaReceipt],
    ['FaShieldAlt', FaShieldAlt],
    ['FaShoppingBag', FaShoppingBag],
    ['FaStickyNote', FaStickyNote],
    ['FaTimesCircle', FaTimesCircle],
    ['FaTrash', FaTrash],
    ['FaTruck', FaTruck],
    ['FaUndo', FaUndo],
    ['FaUsersCog', FaUsersCog],
    ['FaUserShield', FaUserShield],
  ]

  for (const [name, component] of faIcons) {
    catalog.push({ name, component, group: 'FontAwesome' })
  }

  return catalog
}

const iconCatalog = buildIconCatalog()

// ── Group icons by source for the picker ────────────────────────────────────
const groupedIcons = iconCatalog.reduce<Record<string, IconEntry[]>>((acc, icon) => {
  if (!acc[icon.group]) acc[icon.group] = []
  acc[icon.group].push(icon)
  return acc
}, {})

const groupOrder = ['Lucide', 'Tabler', 'FontAwesome']

// ── Props ───────────────────────────────────────────────────────────────────

interface IconPickerProps {
  form: UseFormReturn<any>
  name: string
  label?: string
  placeholder?: string
}

// ── Component ───────────────────────────────────────────────────────────────

export function IconPicker({ form, name, label = 'Icon', placeholder = 'Select icon…' }: IconPickerProps) {
  const [open, setOpen] = React.useState(false)
  const currentValue = form.watch(name)
  const selectedIcon = currentValue
    ? iconCatalog.find((i) => i.name === currentValue)
    : null

  const SelectedIconComponent = selectedIcon?.component ?? null

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className='grid grid-cols-[110px_1fr] gap-1 items-start'>
          <FormLabel className='text-right pt-1'>{label}</FormLabel>
          <div className='flex flex-col gap-1.5'>
            <Popover open={open} onOpenChange={setOpen} modal={false}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    className='w-full justify-between h-9'
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      {SelectedIconComponent ? (
                        <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded border bg-background'>
                          <SelectedIconComponent className='h-3 w-3 text-muted-foreground' />
                        </div>
                      ) : (
                        <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded border bg-muted'>
                          <Package className='h-2.5 w-2.5 text-muted-foreground/50' />
                        </div>
                      )}
                      <span className={cn('text-sm truncate', !currentValue && 'text-muted-foreground')}>
                        {currentValue ?? placeholder}
                      </span>
                    </div>
                    <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className='popover-content-width-same-as-trigger p-0' align='start'>
                <Command className='rounded-lg border shadow-md'>
                  <CommandInput placeholder='Search icons…' />
                  <CommandList className='max-h-72 overflow-y-auto'>
                    <CommandEmpty>No icon found.</CommandEmpty>
                    {groupOrder
                      .filter((g) => groupedIcons[g]?.length > 0)
                      .map((group) => (
                        <CommandGroup key={group} heading={group}>
                          <div className='grid grid-cols-5 gap-1 p-1'>
                            {groupedIcons[group].map((icon) => {
                              const IconComponent = icon.component
                              const isSelected = currentValue === icon.name
                              return (
                                <CommandItem
                                  key={icon.name}
                                  value={icon.name}
                                  onSelect={() => {
                                    form.setValue(name, isSelected ? '' : icon.name, { shouldDirty: true })
                                    setOpen(false)
                                  }}
                                  className='flex flex-col items-center gap-1 p-1.5 cursor-pointer rounded-md hover:bg-muted/60'
                                >
                                  <div
                                    className={cn(
                                      'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
                                      isSelected
                                        ? 'border-primary bg-primary/[0.06]'
                                        : 'border-border bg-background hover:bg-muted',
                                    )}
                                  >
                                    <IconComponent className='h-4 w-4 text-muted-foreground' />
                                  </div>
                                  <span
                                    className={cn(
                                      'text-[8px] text-center leading-tight truncate w-full',
                                      isSelected && 'font-medium text-primary',
                                    )}
                                  >
                                    {icon.name}
                                  </span>
                                  {isSelected && (
                                    <CheckIcon className='absolute top-0.5 right-0.5 h-3 w-3 text-primary' />
                                  )}
                                </CommandItem>
                              )
                            })}
                          </div>
                        </CommandGroup>
                      ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* Selected icon preview */}
            {currentValue && SelectedIconComponent && (
              <div className='flex items-center gap-2 text-[10px] text-muted-foreground'>
                <span>Preview:</span>
                <div className='flex h-6 w-6 items-center justify-center rounded border bg-background'>
                  <SelectedIconComponent className='h-3.5 w-3.5 text-foreground/70' />
                </div>
                <code className='rounded bg-muted px-1 py-0.5 font-mono text-[9px]'>{currentValue}</code>
                <button
                  type='button'
                  className='ml-auto text-[9px] text-muted-foreground/50 hover:text-destructive transition-colors'
                  onClick={() => form.setValue(name, '', { shouldDirty: true })}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <FormMessage className='col-start-3' />
        </FormItem>
      )}
    />
  )
}

export default IconPicker
