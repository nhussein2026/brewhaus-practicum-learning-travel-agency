import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const demoMode = env.VITE_DEMO_MODE !== 'false'

  return {
    plugins: [
      react(),
      tailwindcss(),
      // In demo mode, ask search engines not to index the site, so a sample agency never shows up
      // in Google next to real ones. Robots read the HTML before any JavaScript runs, so this has
      // to be in index.html itself, not added by React.
      {
        name: 'wanderly-demo-noindex',
        transformIndexHtml() {
          return demoMode ? [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' }] : []
        },
      },
    ],
    server: {
      // In development, forward /api/* to the Express server so the browser
      // only ever talks to one origin (same as production on Vercel).
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
