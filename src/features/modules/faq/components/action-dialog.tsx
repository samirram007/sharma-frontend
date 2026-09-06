'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'

import { zodResolver } from '@hookform/resolvers/zod'

import FormInputField from '@/components/form-input-field'
import { useForm, type Resolver } from 'react-hook-form'
import { lowerCase } from '@/utils/removeEmptyStrings'

import { Loader2, CalendarDays } from 'lucide-react'
import { useFaqMutation } from '../data/queryOptions'
import {
  formSchema,
  type Faq,
  type FaqForm,
  formatPublishDate,
} from '../data/schema'
import { faqCategories } from '../data/data'
import type { DefaultValues } from 'react-hook-form'

interface Props {
  currentRow?: Faq
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const { mutate: saveFaq, isPending } = useFaqMutation()
  const isEdit = !!currentRow

  const defaultValues: FaqForm = isEdit
    ? {
        question: currentRow?.question ?? '',
        answer: currentRow?.answer ?? '',
        category: currentRow?.category ?? 'general',
        sortOrder: currentRow?.sortOrder ?? 0,
        isPublished: currentRow?.isPublished ?? true,
        isEdit,
      }
    : {
        question: '',
        answer: '',
        category: 'general',
        sortOrder: 0,
        isPublished: true,
        isEdit,
      }

  const createdDate = currentRow?.createdAt
    ? formatPublishDate(currentRow?.createdAt)
    : null

  const form = useForm<FaqForm>({
    resolver: zodResolver(formSchema) as Resolver<FaqForm>,
    defaultValues: defaultValues as DefaultValues<FaqForm>,
  })

  const moduleName = 'FAQ'
  const onSubmit = (values: FaqForm) => {
    form.reset()
    saveFaq(currentRow ? { ...values, id: currentRow.id } : values)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">
            {isEdit ? 'Edit ' : 'Add New '} {moduleName}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isEdit
              ? `Update the ${lowerCase(moduleName)} here. `
              : `Create new ${lowerCase(moduleName)} here. `}
            Click save when you&apos;re done.
            {isEdit && createdDate && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Published on: {createdDate}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="-mr-4 h-[38rem] w-full overflow-y-auto py-1 pr-4">
          <Form {...form}>
            <form
              id="faq-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 p-0.5"
            >
              <FormInputField
                type="text"
                form={form}
                name="question"
                label="Question"
                className="text-base"
              />
              <FormInputField
                type="textarea"
                form={form}
                name="answer"
                label="Answer"
                className="min-h-[120px] text-base"
              />
              <FormInputField
                type="select"
                form={form}
                name="category"
                label="Category"
                className="text-base"
                items={faqCategories.map((c) => ({
                  label: c.charAt(0).toUpperCase() + c.slice(1),
                  value: c,
                }))}
              />
              <FormInputField
                type="number"
                form={form}
                name="sortOrder"
                label="Sort Order"
                className="text-base"
              />
              <FormInputField
                type="checkbox"
                form={form}
                name="isPublished"
                label="Published"
                className="text-base"
                options={[
                  { label: 'Yes', value: true },
                  { label: 'No', value: false },
                ]}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            form="faq-form"
            disabled={isPending}
            className="h-10 px-6 text-base"
          >
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
