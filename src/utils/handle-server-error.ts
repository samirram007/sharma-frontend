import { AxiosError } from 'axios'
import { toast } from "sonner"
export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

  let errMsg: string = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Content not found.---------------------------------------------'
  }

  if (error instanceof AxiosError) {
    errMsg = error.response?.data.title
  }
  toast.message(errMsg)
  // toast({ variant: 'destructive', title: errMsg })
}
