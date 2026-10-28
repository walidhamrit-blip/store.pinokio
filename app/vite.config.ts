import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // SITE_BASE lets the same build be published under a sub-path (a GitHub
  // Pages project site such as /accessoires/). Unset for the Worker, a
  // Pinokio install and local dev, where the site lives at the root.
  base: process.env.SITE_BASE || '/',
  plugins: [react(), tailwindcss(), cloudflare()],
  server: {
    port: 5173,
    strictPort: false,
    // Preview is served through a proxy host, so accept any Host header.
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
