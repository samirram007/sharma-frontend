import { Main } from '@/layouts/components/main'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { Loader, TreePine } from 'lucide-react'
import { columns } from './components/columns'
import { Dialogs } from './components/dialogs'
import { GridTable } from './components/grid-table'
import DndTreeView from './components/dnd-tree-view'
import { PrimaryButtons } from './components/primary-buttons'
import MenuProvider from './contexts/menu-context'
import { useMenu } from './contexts/menu-context'
import { MenuListSchema, MenuTreeSchema, type MenuList } from './data/schema'
import { MenuTreeQueryOptions } from './data/queryOptions'

interface MenuProps {
    data: MenuList
}

function TreeViewSection() {
    const { data: treeData, isLoading, isError } = useQuery(MenuTreeQueryOptions)
    const { setOpen, setCurrentRow } = useMenu()

    if (isLoading) {
        return (
            <div className='flex items-center justify-center py-24'>
                <Loader className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
        )
    }

    if (isError) {
        return (
            <div className='flex items-center justify-center py-24 text-destructive'>
                Failed to load menu tree. Please try again.
            </div>
        )
    }

    const tree = MenuTreeSchema.parse(treeData?.data ?? [])

    return (
        <div className='py-2'>
            <DndTreeView
                data={tree}
                onEdit={(item) => {
                    setCurrentRow(item)
                    setOpen('edit')
                }}
                onDelete={(item) => {
                    setCurrentRow(item)
                    setOpen('delete')
                }}
                onAddChild={(item) => {
                    setCurrentRow(item)
                    setOpen('add')
                }}
            />
        </div>
    )
}

export default function Menu({ data }: MenuProps) {
    console.log('Menu data:', data) // Debugging line to check the data being passed
    return (
        <MenuProvider>
            <Main className='min-w-full'>
                <div className='mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
                    <div className='space-y-1'>
                        <h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>Menu Entries</h2>
                        <p className='text-slate-600 dark:text-slate-400'>
                            Manage the sidebar menu structure, groups, and item hierarchy.
                        </p>
                    </div>
                    <PrimaryButtons />
                </div>
                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <Tabs defaultValue='table' className='w-full'>
                        <div className='mb-4 flex items-center justify-between'>
                            <TabsList>
                                <TabsTrigger value='table'>
                                    <span className='mr-1.5 text-xs'>☰</span>
                                    Table View
                                </TabsTrigger>
                                <TabsTrigger value='tree'>
                                    <TreePine className='mr-1.5 h-3.5 w-3.5' />
                                    Tree View
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value='table'>
                            <GridTable
                                data={MenuListSchema.parse(data ?? [])}
                                columns={columns}
                            />
                        </TabsContent>
                        <TabsContent value='tree' className='mt-0'>
                            <TreeViewSection />
                        </TabsContent>
                    </Tabs>
                </div>
            </Main>
            <Dialogs />
        </MenuProvider>
    )
}
