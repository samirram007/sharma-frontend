import tailwindcss from '@tailwindcss/vite'
import tanstackRouter from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // const isProd = mode === 'production'
  const env = loadEnv(mode, process.cwd())
  return {

    // base: isProd ? '/frontend/' : '/',
    base: env.VITE_BASE_URL,
    server: {
  // port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL, // Your Laravel backend URL
          changeOrigin: true, // Ensures the host header is rewritten to the target
          secure: env.VITE_API_SECURE === 'true', // For local HTTP servers (set to true for HTTPS in production)
          rewrite: (path) => path.replace(/^\/api/, ''), // Optional: removes /api prefix if needed
        },
      },

    },
    build: {
      // ssr: 'src/entry-server.tsx', // for server rendering
      // outDir: 'dist-ssr',
      chunkSizeWarningLimit: 1000,
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
    },
    // server: { 
    //   proxy: {
    //     '/api': {
    //       target: 'https://aipt-api.local',
    //       changeOrigin: true,
    //       rewrite: (path) => path.replace(/^\/api/, ''),
    //     },
    //   },
    // },

    resolve: {
      tsconfigPaths: true,
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  }
}
)
