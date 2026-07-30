import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  capitalizeAllWords,
  capitalizeWords,
  lowerCase,
} from '@/utils/removeEmptyStrings'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import type { Control, UseFormReturn } from 'react-hook-form'
import { SelectDropdown } from './select-dropdown'
import { Button } from './ui/button'
import { Command, CommandGroup, CommandItem } from './ui/command'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Textarea } from './ui/textarea'

type Option = { label: string; value: string | boolean }
type InputType =
  | 'hidden'
  | 'text'
  | 'number'
  | 'textarea'
  | 'checkbox'
  | 'select'
  | 'multiselect'
  | 'date'
type Props = {
  form: UseFormReturn<any>
  control?: Control<any>
  type: InputType
  name: string
  label?: string
  noLabel?: boolean
  options?: Option[]
  items?: { label: string; value: string }[]
  gapClass?: string
  disabled?: boolean
  rtl?: boolean
  tabIndex?: number
  [key: string]: any
}

const FormInputField = (props: Props) => {
  const { type } = props

  // switch case for different input types
  if (type === 'checkbox') {
    return <CheckBox {...props} />
  } else if (type === 'textarea') {
    return <TextAreaBox {...props} />
  } else if (type === 'number') {
    return <NumberBox {...props} />
  } else if (type === 'select') {
    return <SelectBox {...props} />
  } else if (type === 'multiselect') {
    return <MultiSelectBox {...props} />
  } else if (type === 'date') {
    return <DateBox {...props} />
  } else if (type === 'hidden') {
    return <HiddenBox {...props} />
  } else {
    return <TextBox {...props} />
  }
}

const CheckBox = (props: Props) => {
  const { form, name, label, type, options, disabled, tabIndex } = props
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[1fr_24px] sm:items-center sm:gap-y-1">
          <FormLabel className="min-w-0">
            {label ?? capitalizeAllWords(name)} ?
            <Badge
              variant={
                typeof field.value === 'string' ? 'default' : 'secondary'
              }
              className="ml-2 cursor-pointer"
            >
              {(() => {
                // If options provided → show label instead of raw value
                if (options && options.length > 0) {
                  const selected = options.find(
                    (opt) => opt.value === field.value,
                  )
                  return selected ? selected.label : String(field.value)
                }

                // Fallback → show value directly
                return field.value == null
                  ? 'No'
                  : typeof field.value === 'string'
                    ? capitalizeWords(field.value)
                    : typeof field.value === 'boolean'
                      ? field.value
                        ? 'Yes'
                        : 'No'
                      : String(field.value)
              })()}
            </Badge>
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              className="h-6 w-6 justify-self-start sm:justify-self-auto"
              tabIndex={tabIndex}
              autoFocus={tabIndex === 0}
              checked={field.value === 'active' || field.value === true}
              onChange={(e) => {
                const isChecked = e.target.checked
                const value =
                  options && options.length > 0
                    ? isChecked
                      ? options[0].value
                      : options[1]?.value || false
                    : isChecked
                form.setValue(name, value)
              }}
              disabled={disabled ?? false}
            />
          </FormControl>
          <FormLabel className="hidden sm:col-start-2 sm:block"></FormLabel>
          <FormMessage className="sm:col-start-2" />
        </FormItem>
      )}
    />
  )
}

const TextAreaBox = (props: Props) => {
  const { form, name, gapClass, rtl, label, noLabel, ...rest } = props
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[100px_1fr] sm:items-center sm:gap-y-1',
            gapClass,
          )}
        >
          {!noLabel && (
            <FormLabel className={rtl ? 'order-last' : ''}>
              {label ?? capitalizeAllWords(name)}
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              className="resize-none   placeholder"
              placeholder={`Add a ${name} to your entry`}
              {...field}
            />
          </FormControl>
          <FormMessage className="sm:col-start-2" />
        </FormItem>
      )}
      {...rest}
    />
  )
}

const TextBox = (props: Props) => {
  const { form, name, label, gapClass, rtl, noLabel, tabIndex, ...rest } = props
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[100px_1fr] sm:items-center sm:gap-y-1',
            gapClass,
          )}
        >
          {!noLabel && (
            <FormLabel className={rtl ? 'order-last' : ''}>
              {label ?? capitalizeAllWords(name)}
            </FormLabel>
          )}
          <FormControl>
            <Input
              tabIndex={tabIndex}
              autoFocus={tabIndex === 0}
              placeholder={'Enter ' + lowerCase(label ?? name)}
              className="w-full placeholder"
              autoComplete="off"
              {...field}
            />
          </FormControl>
          <FormMessage className="sm:col-start-2" />
        </FormItem>
      )}
      {...rest}
    />
  )
}
const HiddenBox = (props: Props) => {
  const { form, name, label, gapClass, tabIndex, ...rest } = props
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'hidden grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
            gapClass,
          )}
        >
          <FormLabel className="   ">
            {label ?? capitalizeAllWords(name)}
          </FormLabel>
          <FormControl>
            <Input
              tabIndex={tabIndex}
              autoFocus={tabIndex === 0}
              placeholder={'Enter ' + lowerCase(label ?? name)}
              className=" placeholder"
              autoComplete="off"
              {...field}
            />
          </FormControl>
          <FormMessage className=" col-start-2" />
        </FormItem>
      )}
      {...rest}
    />
  )
}
const DateBox = (props: Props) => {
  const { form, name, label, gapClass, noLabel, tabIndex, ...rest } = props
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[100px_1fr] sm:items-center sm:gap-y-1',
            gapClass,
          )}
        >
          {!noLabel && (
            <FormLabel className="   ">
              {label ?? capitalizeAllWords(name)}
            </FormLabel>
          )}
          <FormControl>
            <Input
              tabIndex={tabIndex}
              autoFocus={tabIndex === 0}
              placeholder={'Enter ' + (label ?? lowerCase(label ?? name))}
              className="w-full placeholder"
              autoComplete="off"
              {...rest}
              {...field}
              value={formatDateForInput(field.value)}
            />
          </FormControl>
          <FormMessage className="sm:col-start-2" />
        </FormItem>
      )}
      {...rest}
    />
  )
}

function formatDateForInput(value: unknown): string {
  if (!value) return ''

  if (value instanceof Date) {
    return value.toISOString().split('T')[0]
  }

  if (typeof value === 'string') {
    return value.includes('T') ? value.split('T')[0] : value
  }

  return ''
}
const NumberBox = (props: Props) => {
  const { form, name, label, type, gapClass, tabIndex, noLabel, rtl, ...rest } =
    props
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[100px_1fr] sm:items-center sm:gap-y-1',
            gapClass,
          )}
        >
          {!noLabel && (
            <FormLabel className={rtl ? 'order-last' : ''}>
              {label ?? capitalizeAllWords(name)}
            </FormLabel>
          )}
          <FormControl>
            <Input
              tabIndex={tabIndex}
              autoFocus={tabIndex === 0}
              type={type}
              placeholder={'Enter ' + lowerCase(label ?? name)}
              className=" placeholder"
              autoComplete="off"
              {...field}
            />
          </FormControl>
          <FormMessage className="sm:col-start-2" />
        </FormItem>
      )}
      {...rest}
    />
  )
}

const SelectBox = (props: Props) => {
  const { form, name, label, items, noLabel, gapClass } = props
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[100px_1fr] sm:items-center sm:gap-y-1',
            gapClass,
          )}
        >
          {!noLabel && (
            <FormLabel className="   ">
              {label ?? capitalizeAllWords(name)}
            </FormLabel>
          )}
          <FormControl>
            <SelectDropdown
              defaultValue={field.value ? field.value.toString() : ''}
              onValueChange={(value) => form.setValue(name, value)}
              placeholder={`Select a ${label ?? capitalizeAllWords(name)}`}
              className="w-full"
              items={items}
            />
          </FormControl>
          <FormMessage className="sm:col-start-2" />
        </FormItem>
      )}
    />
  )
}
const MultiSelectBox = (props: Props) => {
  const { form, name, label, items, gapClass } = props
  const [open, setOpen] = useState(false)

  const selectedValues: string[] = form.watch(name) || []

  const toggleValue = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]
    form.setValue(name, newValues, { shouldValidate: true })
  }
  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem
          className={cn(
            'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[100px_1fr] sm:items-center sm:gap-y-1',
            gapClass,
          )}
        >
          <FormLabel>{label ?? capitalizeAllWords(name)}</FormLabel>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between w-full"
                >
                  {selectedValues.length > 0
                    ? `${selectedValues.length} selected`
                    : `Select ${label ?? name}`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[250px]">
                <Command>
                  <CommandGroup>
                    {items!.map((item) => (
                      <CommandItem
                        key={item.value}
                        onSelect={() => toggleValue(item.value)}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            selectedValues.includes(item.value)
                              ? 'opacity-100'
                              : 'opacity-0'
                          }`}
                        />
                        {item.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage className="sm:col-start-2" />
        </FormItem>
      )}
    />
  )
}
export default FormInputField
export { CheckBox, MultiSelectBox, NumberBox, SelectBox, TextAreaBox, TextBox }
