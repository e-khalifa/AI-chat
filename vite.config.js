import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dotenv from 'dotenv'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_OPEN_AI_API_KEY': JSON.stringify(process.env.VITE_OPEN_AI_API_KEY)
  }
})
