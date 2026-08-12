import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useQuery } from '@tanstack/react-query'
import { fetchMenuService } from '../../data/api'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { MenuForm } from '../../types/types'
import type { Menu } from '../../data/schema'

type FormProps = {
  form: UseFormReturn<MenuForm>
}

const ParentMenuDropdown = (props: FormProps) => {
  const { form } = props
  const { data: menusData, isLoading } = useQuery({
    queryKey: ['Menus'],
    queryFn: () => fetchMenuService(),
  })
  const menus: Menu[] = menusData?.data ?? []

  const [open, setOpen] = React.useState(false)
  const value = form.watch('parentId')?.toString()

  const handleSelect = (selectedValue: string) => {
    form.setValue('parentId', Number(selectedValue))
    setOpen(false)
  }

  const handleClear = () => {
    form.setValue('parentId', undefined as any)
    setOpen(false)
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading menus...</div>
  }

  return (
    <FormField
      control={form.control}
      name={'parentId'}
      render={() => (
        <FormItem className="grid grid-cols-[110px_1fr] gap-1">
          <FormLabel className="text-right">Parent Menu</FormLabel>
          <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {value
                  ? (menus.find((m) => String(m.id) === value)?.menuName ??
                    'Select parent...')
                  : 'None (root level)'}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="popover-content-width-same-as-trigger p-0">
              <Command className="rounded-lg border shadow-md min-w-full">
                <CommandInput placeholder="Search menu..." />
                <CommandList className="max-h-64 overflow-y-auto">
                  <CommandEmpty>No menu found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={handleClear}>
                      <CheckIcon
                        className={cn(
                          'mr-2 h-4 w-4',
                          !value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="text-muted-foreground">
                        None (root level)
                      </span>
                    </CommandItem>
                    {menus.map((m) => (
                      <CommandItem
                        key={m.id}
                        value={m.menuName}
                        onSelect={() => handleSelect(String(m.id))}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === String(m.id)
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        <span>{m.menuName}</span>
                        {m.isGroup && (
                          <span className="ml-2 text-[10px] text-muted-foreground">
                            (group)
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage className="col-start-3" />
        </FormItem>
      )}
    />
  )
}

export default ParentMenuDropdown
