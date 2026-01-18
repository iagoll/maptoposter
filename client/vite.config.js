import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Vuetify plugin for auto-import and treeshaking
    vuetify({
      autoImport: true,
    }),
  ],
  
  // Path aliases
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  
  // Development server configuration
  server: {
    port: 5173,
    // Proxy API requests to backend (LOCAL DEVELOPMENT ONLY)
    // On Vercel, this is ignored - frontend uses VITE_API_BASE_URL directly
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimize chunk size for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'vuetify-vendor': ['vuetify'],
        },
      },
    },
  },
})
