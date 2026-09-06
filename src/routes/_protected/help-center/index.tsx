import { Main } from '@/layouts/components/main'
import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  IconApps,
  IconHelp,
  IconLayoutDashboard,
  IconRoute,
  IconTicket,
} from '@tabler/icons-react'
import { useState } from 'react'
import FaqProvider from '@/features/modules/faq/contexts/faq-context'
import TicketProvider from '@/features/modules/ticket/contexts/ticket-context'
import FaqHelpCenterTab from '@/features/modules/faq/components/help-center-tab'
import TicketHelpCenterTab from '@/features/modules/ticket/components/help-center-tab'
import OverviewTab from '@/features/help-center/components/overview-tab'
import ModulesTab from '@/features/help-center/components/modules-tab'
import WorkflowsTab from '@/features/help-center/components/workflows-tab'

export const Route = createFileRoute('/_protected/help-center/')({
  component: HelpCenter,
})

function HelpCenter() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <FaqProvider>
      <TicketProvider>
        <Main className="min-w-full">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Help Center
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Learn about the application, its modules, services and workflows
                — or get help from our team.
              </p>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4 h-auto flex-wrap justify-start">
              <TabsTrigger value="overview" className="gap-1.5">
                <IconLayoutDashboard size={16} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="modules" className="gap-1.5">
                <IconApps size={16} />
                Modules &amp; Services
              </TabsTrigger>
              <TabsTrigger value="workflows" className="gap-1.5">
                <IconRoute size={16} />
                Workflows &amp; Guides
              </TabsTrigger>
              <TabsTrigger value="faqs" className="gap-1.5">
                <IconHelp size={16} />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="tickets" className="gap-1.5">
                <IconTicket size={16} />
                Support Tickets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="modules">
              <ModulesTab />
            </TabsContent>

            <TabsContent value="workflows">
              <WorkflowsTab />
            </TabsContent>

            <TabsContent value="faqs">
              <FaqHelpCenterTab />
            </TabsContent>

            <TabsContent value="tickets">
              <TicketHelpCenterTab />
            </TabsContent>
          </Tabs>
        </Main>
      </TicketProvider>
    </FaqProvider>
  )
}
