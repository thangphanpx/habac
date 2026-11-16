import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  server: { port: 30001, strictPort: true },
  plugins: [tanstackStart(), nitro({ preset: process.env.VERCEL ? 'vercel' : 'bun' }), viteReact()],
})
