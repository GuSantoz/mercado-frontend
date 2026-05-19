import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Necessário para o Docker expor a porta corretamente
    port: 5173,
    watch: {
      usePolling: true, // A MÁGICA ACONTECE AQUI: Força o Vite a ler as mudanças no Docker!
    }
  }
})