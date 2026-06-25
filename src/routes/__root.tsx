import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'



import { NavigationProgress } from '@/components/navigation-progress'
import type { MyRouterContext } from '@/core/contexts/MyRouterContext'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import LayoutAddition from '@/integrations/tanstack-query/layout'


export const Route = createRootRouteWithContext<MyRouterContext>()({

  component: () => (
    <>
      <NavigationProgress /> 
      <Outlet />
      <LayoutAddition />
    </>
  ),

  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
