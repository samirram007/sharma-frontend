import { AxiosError } from 'axios'
import { toast } from 'sonner'

type ServerErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Extract a user-facing message from an API error response. Prefers the
 * server's `message` and appends field-level validation errors (Laravel 422
 * shape: `{ message, errors: { field: [msgs] } }`) so the toast shows exactly
 * why the save failed.
 */
export function getServerErrorMessage(
  error: unknown,
  fallback = 'Something went wrong!',
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ServerErrorPayload | undefined
    const serverMessage = data?.message
    const fieldErrors = data?.errors

    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const details = Object.entries(fieldErrors)
        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
        .join('; ')
      return serverMessage ? `${serverMessage} ${details}` : details
    }

    if (serverMessage) return serverMessage
  }
  return fallback
}

export function handleServerError(error: unknown) {
  console.log(error)

  let fallback = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    fallback = 'Content not found.'
  }

  toast.message(getServerErrorMessage(error, fallback))
  // toast({ variant: 'destructive', title: errMsg })
}
