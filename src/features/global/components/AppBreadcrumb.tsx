import { Link } from '@tanstack/react-router'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import { IconHome } from '@tabler/icons-react'

export type BreadcrumbItemType = {
    label: string
    href?: string
}

interface AppBreadcrumbsProps {
    items: BreadcrumbItemType[]
}

export function AppBreadcrumbs({ items }: AppBreadcrumbsProps) {
    //   if (!items?.length) return null

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1

                    return (
                        <BreadcrumbItem key={item.label}>
                            {isLast || !item.href ? (

                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild className='font-bold text-blue-800'>
                                    <Link to={item.href}>{item.label === 'Home' ? <IconHome size={16} /> : item.label}</Link>
                                </BreadcrumbLink>
                            )}
                            {!isLast && <BreadcrumbSeparator />}
                        </BreadcrumbItem>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}