import { cn } from '@/lib/utils'
import React from 'react'

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Main = ({ fixed, ...props }: MainProps) => {
  return (
    <main
      className={cn(
        'peer-[.header-fixed]/header:mt-16',
        'px-2 py-0 md:px-2 2xl:px-3',
        fixed && 'fixed-main flex grow flex-col overflow-hidden',
      )}
      {...props}
    />
  )
}

Main.displayName = 'Main'
