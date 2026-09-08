import SkipToMain from '@/components/skip-to-main'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { SearchProvider } from '@/core/contexts/search-context'
import { Suspense } from 'react'
import { AppSidebar } from './components/app-sidebar'
import Footer from './components/footer'
import HeaderComponent from './components/HeaderComponent'
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
              <div className="relative  flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-2">
              {/* <div className="relative grid grid-rows-[auto_auto_1fr_auto]  overflow-y-auto overflow-x-hidden"> */}
                <HeaderComponent />
                
                {/* <main className="flex-1"> */}
                <div className="flex-1 pt-2">
                  <Suspense fallback={<Toaster />}>
                    {/* Renders the matched route — or the 403 content on the
                    same URL when a route guard blocked the navigation. */}
                    <ForbiddenGate />
                  </Suspense>
                </div>
                <Footer />
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
