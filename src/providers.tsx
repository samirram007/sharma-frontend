import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/sonner'
import { FontProvider } from './core/contexts/font-context'
import { ThemeContextProvider } from './core/contexts/ThemeContextProvider'
import { AuthProvider } from './features/auth/contexts/AuthContext'

const queryClient = new QueryClient()
function ClientOnly({ children }: { children: React.ReactNode }) {
    return typeof window !== "undefined" ? <>{children}</> : null
}
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeContextProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <FontProvider>
                    <AuthProvider>
                        <ClientOnly>
                            <Toaster position="top-center" richColors />
                        </ClientOnly>
                        {children}
                    </AuthProvider>
                </FontProvider>
            </ThemeContextProvider>
        </QueryClientProvider>
    )
}