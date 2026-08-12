import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import tanstackRouter from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // const isProd = mode === 'production'
  const env = loadEnv(mode, process.cwd())
  // Strip a trailing `/api` from VITE_BACKEND_URL (a common copy-paste mistake):
  // the dev proxy forwards the full request path, so a suffixed target would
  // double the prefix (e.g. /api/... -> host/api/api/...).
  const backendTarget = (
    env.VITE_BACKEND_URL || 'http://localhost:8000'
  ).replace(/\/api\/?$/, '')
  return {
    // base: isProd ? '/frontend/' : '/',
    base: env.VITE_BASE_URL,
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: env.VITE_API_SECURE === 'true',
          // Do NOT rewrite /api — Laravel routes are already prefixed with /api
        },
        // Laravel Echo channel-auth endpoint (registered outside /api by
        // Broadcast::routes()) — proxy it so dev broadcasting auth works even
        // when VITE_API_BASE_URL is relative.
        '/broadcasting': {
          target: backendTarget,
          changeOrigin: true,
          secure: env.VITE_API_SECURE === 'true',
        },
      },
    },
    build: {
      // ssr: 'src/entry-server.tsx', // for server rendering
      // outDir: 'dist-ssr',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // if (id.includes('src/features/accounts/settings')) {
            //   return 'accounts-settings'
            // }

            if (id.includes('src/features/masters/accounts')) {
              return 'accounts'
            }
          },
        },
      },
    },
    plugins: [
      {
        name: 'suppress-eval-warning',
        configResolved(config) {
          const originalWarn = console.warn
          console.warn = (...args) => {
            const message = typeof args[0] === 'string' ? args[0] : ''
            if (
              message.includes('direct `eval`') ||
              message.includes('direct eval')
            ) {
              return
            }
            originalWarn.apply(console, args)
          }
        },
      },
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        spa: {
          enabled: true,
          prerender: {
            crawlLinks: true,
          },
        },
        sitemap: {
          host: 'https://localhost:3000',
        },
      }),
      react(),
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['react-is'],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      // e2e/ specs belong to Playwright (pnpm test:e2e), not Vitest — exclude
      // them so `pnpm test` only collects unit/integration tests.
      exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    },

    resolve: {
      tsconfigPaths: true,
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  }
})
