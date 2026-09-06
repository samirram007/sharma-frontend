import { cn } from '@/lib/utils'
import { permissionLabel, type ForbiddenDetails } from '@/lib/forbidden-details'
import { ShieldX, Lock } from 'lucide-react'
import { ErrorActions } from './error-actions'
import { ErrorDetails } from './error-details'
import { useAuthSafe } from './use-auth-safe'

interface ForbiddenErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
  /**
   * Why access was denied. In-place rendering (the protected layout gate)
   * passes the live details from the guard; the standalone /403 page renders
   * without them and falls back to generic copy.
   */
  details?: ForbiddenDetails | null
}

/** Small mono chip showing the raw permission code. */
function PermissionCodeChip({ code }: { code: string }) {
  return (
    <code className="ml-1.5 inline-block max-w-full overflow-hidden rounded border border-red-200 bg-red-50 px-1.5 py-px font-mono text-[10px] text-red-700 align-middle whitespace-nowrap text-ellipsis dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
      {code}
    </code>
  )
}

export default function ForbiddenError({
  className,
  minimal = false,
  details,
}: ForbiddenErrorProps) {
  const { user, isAuthenticated } = useAuthSafe()

  const missingCodes = details?.permissionCodes?.length
    ? details.permissionCodes
    : null
  const pageName = details?.pageName

  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5',
        minimal ? 'min-h-full' : 'h-svh',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 text-center">
        {/* Animated shield icon */}
        <div className="relative mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-destructive/10 ring-1 ring-destructive/20">
            <ShieldX className="h-12 w-12 text-destructive" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 ring-4 ring-background dark:bg-amber-900/40">
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {!minimal && (
          <h1 className="mb-2 text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl">
            403
          </h1>
        )}

        <h2 className="mb-3 text-xl font-semibold text-foreground sm:text-2xl">
          Access Denied
        </h2>

        {isAuthenticated && user ? (
          <p className="mb-3 w-full max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sorry{' '}
            <span className="font-medium text-foreground">{user.name}</span>,
            your account doesn&apos;t have permission to view{' '}
            {pageName ? (
              <>
                the{' '}
                <span className="font-medium text-foreground">{pageName}</span>{' '}
                page
              </>
            ) : (
              'this page'
            )}
            . Access is controlled by your role and the permissions assigned to
            it.
          </p>
        ) : (
          <p className="mb-3 w-full max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            You don&apos;t have permission to view{' '}
            {pageName ? (
              <>
                the{' '}
                <span className="font-medium text-foreground">{pageName}</span>{' '}
                page
              </>
            ) : (
              'this page'
            )}
            . Access is controlled by your role and the permissions assigned to
            it.
          </p>
        )}

        <ErrorDetails code="403" path={details?.attemptedPath}>
          {missingCodes ? (
            missingCodes.length === 1 ? (
              <li>
                Your role is missing the{' '}
                <span className="font-semibold text-foreground">
                  {permissionLabel(missingCodes[0])}
                </span>{' '}
                permission
                {pageName
                  ? ` needed to open the ${pageName} page`
                  : ' required to view this page'}
                .<PermissionCodeChip code={missingCodes[0]} />
              </li>
            ) : (
              <li className="max-w-xl">
                Your role has none of the permissions required to open
                {pageName ? (
                  <>
                    {' '}
                    the{' '}
                    <span className="font-semibold text-foreground">
                      {pageName}
                    </span>{' '}
                    page
                  </>
                ) : (
                  ' this page'
                )}
                :
                <span className="flex flex-wrap items-center gap-1 pt-1">
                  {missingCodes.map((code) => (
                    <PermissionCodeChip key={code} code={code} />
                  ))}
                </span>
              </li>
            )
          ) : pageName ? (
            <li>
              The{' '}
              <span className="font-semibold text-foreground">{pageName}</span>{' '}
              page may be hidden from the sidebar or restricted to a specific
              role.
            </li>
          ) : (
            <li>
              The page may be hidden from the sidebar or restricted to a
              specific role.
            </li>
          )}
          <li>
            Contact your administrator to request access if you believe this is
            a mistake.
          </li>
          <li>
            In the meantime, use the navigation to reach a page you can access.
          </li>
        </ErrorDetails>

        <ErrorActions />
      </div>
    </div>
  )
}
