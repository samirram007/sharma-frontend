import { IconFile, IconFolder } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DocumentHelpCenterTab() {
  // This is a placeholder for the Document Manager integration.
  // The full Document Manager has its own module and routes.
  // This tab provides a quick-access view for help-related documents.

  const quickLinks = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of setting up and using the application.',
      category: 'Onboarding',
    },
    {
      title: 'Voucher Entry Guide',
      description:
        'Step-by-step instructions for creating and managing vouchers.',
      category: 'Transactions',
    },
    {
      title: 'Stock Management',
      description: 'How to manage stock items, godowns, and inventory.',
      category: 'Inventory',
    },
    {
      title: 'Report Generation',
      description:
        'Generate and export various financial and operational reports.',
      category: 'Reports',
    },
    {
      title: 'User & Role Management',
      description:
        'Manage users, roles, and permissions for your organization.',
      category: 'Administration',
    },
    {
      title: 'Fiscal Year Operations',
      description: 'Open and close fiscal years, manage opening balances.',
      category: 'Setup',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Quick access to documentation and guides.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/documents">Open Document Manager</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((doc) => (
          <div
            key={doc.title}
            className="group cursor-pointer rounded-md border border-slate-200/70 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/5 dark:hover:bg-white/8"
          >
            <div className="mb-2 flex items-start gap-2">
              <IconFile
                size={18}
                className="mt-0.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
              />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {doc.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {doc.description}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {doc.category}
            </Badge>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-dashed border-slate-200 p-6 text-center dark:border-white/[0.07]">
        <IconFolder size={32} className="mx-auto mb-2 text-slate-300" />
        <p className="text-sm text-slate-500">
          For the full document management experience, use the{' '}
          <Link
            to="/documents"
            className="font-medium text-blue-600 hover:underline dark:text-sky-400"
          >
            Document Manager
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
