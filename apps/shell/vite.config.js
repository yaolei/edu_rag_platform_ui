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
          'react': { singleton: true },
          'react-dom': { singleton: true },
          'react-router': { singleton: true },
          '@workspace/shared-util': { singleton: true, requiredVersion: '1.0.0' },
        }
      }),
    ],
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // 强制拆包，不依赖任何分析
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 1. 将MUI拆成单独包
              if (id.includes('@mui/material') || 
                  id.includes('@mui/icons-material') ||
                  id.includes('@mui/x-data-grid') ||
                  id.includes('@mui/x-date-pickers') ||
                  id.includes('@emotion')) {
                return 'vendor-mui'
              }
              // 2. 将ECharts拆成单独包
              if (id.includes('echarts')) {
                return 'vendor-echarts'
              }
              // 3. 将React相关拆成单独包
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react'
              }
              // 4. 将Redux相关拆成单独包
              if (id.includes('redux') || id.includes('@reduxjs')) {
                return 'vendor-redux'
              }
              // 5. 将其他依赖拆成vendor包
              return 'vendor-other'
            }
          }
        }
      },
      chunkSizeWarningLimit: 2000,
      outDir,
    },
  }
})
