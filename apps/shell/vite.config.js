import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const outDir = process.env.BUILD_OUT_DIR || 'dist'
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      federation({
        name: 'shell',
        remotes: {
            eduAdmin: isProd
            ? 'http://106.12.58.7/admin/assets/eduAdminEntry.js'
            : 'http://localhost:5002/assets/eduAdminEntry.js',
        },
        shared: {
          '@workspace/shared-util': { singleton: true, requiredVersion: '1.0.0' },
          '@workspace/shared-components': { singleton: true, requiredVersion: '1.0.0' },
          'react': { singleton: true },
          'react-dom': { singleton: true },
          'react-router': { singleton: true },
        }
      }),
    ],
    optimizeDeps:{
      exclude:['eduAdmin/AdminApp'],
    },
    server:{
      port: 5100,
      host:true
    },
    preview:{
      port: 5100,
      host:true
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      modulePreload: { polyfill: true },
      emptyOutDir: true,
      outDir,
    },
  }
})