import { Main } from "@/layouts/components/main"
import {
    IconArrowRight,
    IconBuilding,
    IconBuildingWarehouse,
    IconCash,
    IconCertificate,
    IconPackage,
    IconSettings2,
    IconUsers,
} from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"

function MastersLanding() {
    const sections = [
        {
            title: 'Organization',
            description: 'Configure company profile, fiscal years, currencies, countries and states.',
            href: '/masters/organization/company',
            icon: <IconBuilding className='h-5 w-5' />,
            cta: 'Open Organization',
            tone: {
                card: 'from-cyan-50/90 via-white to-sky-50/80 dark:from-cyan-950/20 dark:via-slate-950/70 dark:to-sky-950/20',
                badge: 'border-cyan-200/80 bg-cyan-100/80 text-cyan-700 dark:border-cyan-900/70 dark:bg-cyan-950/50 dark:text-cyan-300',
                line: 'from-cyan-400/60 to-sky-500/60 dark:from-cyan-600/60 dark:to-sky-600/60',
            },
        },
        {
            title: 'Accounts',
            description: 'Set up account nature, groups, ledgers and voucher configurations.',
            href: '/masters/accounts/account_nature',
            icon: <IconCash className='h-5 w-5' />,
            cta: 'Open Accounts',
            tone: {
                card: 'from-emerald-50/90 via-white to-lime-50/80 dark:from-emerald-950/20 dark:via-slate-950/70 dark:to-lime-950/20',
                badge: 'border-emerald-200/80 bg-emerald-100/80 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300',
                line: 'from-emerald-400/60 to-lime-500/60 dark:from-emerald-600/60 dark:to-lime-600/60',
            },
        },
        {
            title: 'Party',
            description: 'Manage suppliers, distributors and transporters with linked ledger data.',
            href: '/masters/party/distributor',
            icon: <IconUsers className='h-5 w-5' />,
            cta: 'Open Party',
            tone: {
                card: 'from-rose-50/90 via-white to-pink-50/80 dark:from-rose-950/20 dark:via-slate-950/70 dark:to-pink-950/20',
                badge: 'border-rose-200/80 bg-rose-100/80 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300',
                line: 'from-rose-400/60 to-pink-500/60 dark:from-rose-600/60 dark:to-pink-600/60',
            },
        },
        {
            title: 'Inventory',
            description: 'Configure stock items, groups, categories, units, godowns and storage.',
            href: '/masters/inventory/stock_item',
            icon: <IconPackage className='h-5 w-5' />,
            cta: 'Open Inventory',
            tone: {
                card: 'from-amber-50/90 via-white to-yellow-50/80 dark:from-amber-950/20 dark:via-slate-950/70 dark:to-yellow-950/20',
                badge: 'border-amber-200/80 bg-amber-100/80 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300',
                line: 'from-amber-400/60 to-yellow-500/60 dark:from-amber-600/60 dark:to-yellow-600/60',
            },
        },
        {
            title: 'Payroll',
            description: 'Maintain employee, department, designation and shift master records.',
            href: '/masters/payroll/employee',
            icon: <IconBuildingWarehouse className='h-5 w-5' />,
            cta: 'Open Payroll',
            tone: {
                card: 'from-violet-50/90 via-white to-indigo-50/80 dark:from-violet-950/20 dark:via-slate-950/70 dark:to-indigo-950/20',
                badge: 'border-violet-200/80 bg-violet-100/80 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/50 dark:text-violet-300',
                line: 'from-violet-400/60 to-indigo-500/60 dark:from-violet-600/60 dark:to-indigo-600/60',
            },
        },
        {
            title: 'Statutory',
            description: 'Maintain statutory codes and tax-related master references.',
            href: '/masters/statutory/hsn_sac_code',
            icon: <IconCertificate className='h-5 w-5' />,
            cta: 'Open Statutory',
            tone: {
                card: 'from-teal-50/90 via-white to-cyan-50/80 dark:from-teal-950/20 dark:via-slate-950/70 dark:to-cyan-950/20',
                badge: 'border-teal-200/80 bg-teal-100/80 text-teal-700 dark:border-teal-900/70 dark:bg-teal-950/50 dark:text-teal-300',
                line: 'from-teal-400/60 to-cyan-500/60 dark:from-teal-600/60 dark:to-cyan-600/60',
            },
        },
        {
            title: 'Miscellaneous',
            description: 'Manage delivery places, delivery routes, and delivery vehicle setup.',
            href: '/masters/miscellaneous/delivery_places',
            icon: <IconSettings2 className='h-5 w-5' />,
            cta: 'Open Miscellaneous',
            tone: {
                card: 'from-fuchsia-50/90 via-white to-purple-50/80 dark:from-fuchsia-950/20 dark:via-slate-950/70 dark:to-purple-950/20',
                badge: 'border-fuchsia-200/80 bg-fuchsia-100/80 text-fuchsia-700 dark:border-fuchsia-900/70 dark:bg-fuchsia-950/50 dark:text-fuchsia-300',
                line: 'from-fuchsia-400/60 to-purple-500/60 dark:from-fuchsia-600/60 dark:to-purple-600/60',
            },
        },
    ]

    return (
        <Main className='min-w-0 w-full px-2 py-4 sm:px-2 md:px-2 lg:px-2' fixed>
            <div className='relative overflow-hidden rounded-xl border border-slate-200/70 bg-linear-to-r from-white via-slate-50 to-blue-50/70 p-5 shadow-sm dark:border-white/[0.07] dark:from-slate-950/70 dark:via-slate-950/60 dark:to-blue-950/20'>
                <div className='pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl dark:bg-blue-900/30' />
                <h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>Masters</h2>
                <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
                    Central configuration hub for business masters. Choose a section to manage setup data.
                </p>
            </div>

            <div className='mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2'>
                {sections.map((section) => (
                    <Link
                        key={section.href}
                        to={section.href}
                        className={`group relative overflow-hidden rounded-xl border border-slate-200/70 bg-linear-to-br ${section.tone.card} p-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-20px_rgba(15,23,42,0.4)] dark:border-white/[0.08]`}
                    >
                        <div className={`mb-3 inline-flex rounded-lg border p-2.5 ${section.tone.badge}`}>
                            {section.icon}
                        </div>
                        <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>{section.title}</h3>
                        <p className='mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400'>{section.description}</p>
                        <div className='mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200'>
                            {section.cta}
                            <IconArrowRight className='h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                        </div>
                        <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-linear-to-r ${section.tone.line} opacity-70`} />
                    </Link>
                ))}
            </div>
        </Main>
    )
}
export default MastersLanding