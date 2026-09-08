import { Button } from '@/components/ui/button'
import { IconFiles } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

/**
 * Header shortcut to the Document Manager (/documents) — styled to match the
 * notification bell so the two sit side by side in the header.
 */
export default function DocumentsButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      asChild
      title="Documents"
      className="h-8 w-8 rounded-full border border-slate-200/70 bg-white/80 text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-white/[0.07] dark:bg-secondary/80 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    >
      <Link to="/documents">
        <IconFiles size={18} />
        <span className="sr-only">Documents</span>
      </Link>
    </Button>
  )
}
