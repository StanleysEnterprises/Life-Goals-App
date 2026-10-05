import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Only public (browser-safe) variables. Never add a prefix that would expose the service-role key.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})
