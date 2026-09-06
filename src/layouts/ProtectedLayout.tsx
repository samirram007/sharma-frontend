import SkipToMain from '@/components/skip-to-main'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { SearchProvider } from '@/core/contexts/search-context'
import { Suspense } from 'react'
import { AppSidebar } from './components/app-sidebar'
import Footer from './components/footer'
import HeaderComponent from './components/HeaderComponent'
import ReportingPeriod from '@/features/global/components/reporting-period'
import RouteBreadcrumbs from './components/route-breadcrumbs'
import { ForbiddenGate } from './components/forbidden-gate'

import { GlobalContextProvider } from '@/features/global/contexts/global-context'
import { useWallpaper } from '@/features/modules/document/components/appearance-store'

/** Dimming overlay + fixed background image/color driven by the appearance store. */
function WorkspaceWallpaper() {
  const { url, dim, color, opacity } = useWallpaper()
  if (!url && !color) return null
  return (
    <>
      {/* Backdrop color layer — visible alone when no image, or through the image. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundColor: color ?? undefined }}
      />
      {url && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${url})`, opacity }}
        />
      )}
      {url && dim > 0 && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 bg-black"
          style={{ opacity: dim }}
        />
      )}
    </>
  )
}

const ProtectedLayout = () => {
  // const router = useRouter();
  // const { permissions } = useAuth();
  // if (!permissions.includes(FEATURES.AUTHENTICATION_SIGN_IN)) {
  //     console.log("Redirecting from protected Route")
  //     router.navigate({ to: RestrictRouter.fullPath });
  //     return null;

  // }

  return (
    <GlobalContextProvider>
      <SearchProvider>
        {/* <GodownItemSearchProvider> */}

        <SidebarProvider>
          <SkipToMain />

          <WorkspaceWallpaper />

          <div className="flex">
            {/* <div className="fixed top-0 left-0 w-screen h-svh bg-red-400/5 z-50 flex items-center justify-center shadow-4xl">

                        <h1 className=" w-screen bg-red-400  p-5 shadow-4xl text-4xl text-red-200">PROTECTED LAYOUT</h1>
                        </div> */}
            {/* <!-- ===== Page Wrapper Start ===== --> */}
            <div className="max-w-screen w-full relative flex  h-screen overflow-hidden ">
              <AppSidebar />
              <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <HeaderComponent />
                <div className="px-2 pb-2 pt-2">
                  <div className="rounded-md border border-slate-200/70 bg-white/70 px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm dark:border-white/[0.07] dark:bg-card">
                    <RouteBreadcrumbs />
                  </div>
                </div>
                <main className="flex-1">
                  <Suspense fallback={<Toaster />}>
                    {/* Renders the matched route — or the 403 content on the
                    same URL when a route guard blocked the navigation. */}
                    <ForbiddenGate />
                  </Suspense>
                </main>
                <Footer />
                {/* Global hotkey: Alt+P to open period modal */}
                <ReportingPeriod hideTrigger />
              </div>
            </div>
            {/* <!-- ===== Page Wrapper End ===== --> */}
          </div>
        </SidebarProvider>
        {/* </GodownItemSearchProvider> */}
      </SearchProvider>
    </GlobalContextProvider>
  )
}

export default ProtectedLayout
