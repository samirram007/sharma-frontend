import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

// Import the generated route tree

import { AppRouter } from './AppRouter'
import { Toaster } from './components/ui/sonner'
import { FontProvider } from './core/contexts/font-context'
import { ThemeContextProvider } from './core/contexts/ThemeContextProvider'
import { AuthProvider } from './features/auth/contexts/AuthContext'
import { EchoProvider } from './core/contexts/echo-context'
// import setupLocatorUI from "@locator/runtime";
import './styles.css'
import { TanStackQueryProvider } from './integrations/tanstack-query/root-provider'

// Render the app
const rootElement = document.getElementById('app')
// const process = import.meta.env
// if (process.VITE_DEV === "true") {
//   setupLocatorUI();
// }
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider>
        <ThemeContextProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <FontProvider>
            <AuthProvider>
              <EchoProvider>
                <Toaster position="top-center" richColors />
                <AppRouter />
              </EchoProvider>
            </AuthProvider>
          </FontProvider>
        </ThemeContextProvider>
      </TanStackQueryProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
