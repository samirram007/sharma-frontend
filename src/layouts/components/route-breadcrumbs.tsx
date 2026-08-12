import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link, useLocation } from '@tanstack/react-router'
import { IconHome } from '@tabler/icons-react'

const LABEL_OVERRIDES: Record<string, string> = {
  masters: 'Masters',
  organization: 'Organization',
  accounts: 'Accounts',
  party: 'Party',
  inventory: 'Inventory',
  payroll: 'Payroll',
  miscellaneous: 'Miscellaneous',
  administration: 'Administration',
  delivery_places: 'Delivery Places',
  delivery_routes: 'Delivery Routes',
  delivery_vehicles: 'Delivery Vehicles',
  stock_item: 'Stock Item',
  stock_group: 'Stock Group',
  stock_category: 'Stock Category',
  stock_unit: 'Stock Unit',
  unique_quantity_code: 'Unique Quantity Code',
  fiscal_year: 'Fiscal Year',
  account_group: 'Account Group',
  account_nature: 'Account Nature',
  account_ledger: 'Account Ledger',
  voucher_type: 'Voucher Type',
  voucher_category: 'Voucher Category',
  voucher_classification: 'Voucher Classification',
  employee_group: 'Employee Group',
  app_module: 'App Module',
  app_module_feature: 'App Features',
}

const HREF_OVERRIDES: Record<string, string> = {
  '/masters': '/masters',
  '/masters/organization': '/masters/organization/company',
}

const isDynamicSegment = (segment: string) =>
  /^\d+$/.test(segment) || /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(segment)

const toTitle = (value: string) =>
  value
    .replace(/^_+/, '')
    .replace(/\$/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())

export default function RouteBreadcrumbs() {
  const { pathname } = useLocation()

  const rawSegments = pathname.split('/').filter(Boolean)

  const baseIndex = (() => {
    const mastersIndex = rawSegments.indexOf('masters')
    if (mastersIndex >= 0) return mastersIndex

    const administrationIndex = rawSegments.indexOf('administration')
    if (administrationIndex >= 0) return administrationIndex

    return 0
  })()

  const segments = rawSegments
    .slice(baseIndex)
    .filter(
      (segment) =>
        !segment.startsWith('_') &&
        segment !== 'index' &&
        segment !== 'layout' &&
        !isDynamicSegment(segment),
    )

  if (!segments.length) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to="/"
              className="inline-flex items-center text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
            >
              <IconHome size={15} />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          const rawHref = `/${segments.slice(0, index + 1).join('/')}`
          const href = HREF_OVERRIDES[rawHref] ?? rawHref
          const label = LABEL_OVERRIDES[segment] ?? toTitle(segment)

          return (
            <BreadcrumbItem key={`${segment}-${index}`}>
              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={href}>{label}</Link>
                </BreadcrumbLink>
              )}
              {!isLast && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
