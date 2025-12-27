// apps/shell/vite.config.js
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
          'react': { singleton: true, eager: true },
          'react-dom': { singleton: true, eager: true },
          'react-router': { singleton: true, eager: true },
          '@workspace/shared-util': { singleton: true, requiredVersion: '1.0.0', eager: true },
        },
        filename: 'federation-entry.js'
      }),
    ],
    optimizeDeps: {
      exclude: ['eduAdmin/AdminApp'],
    },
    server: {
      port: 5100,
      host: true,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    },
    preview: {
      port: 5100,
      host: true,
      cors: true
    },
build: {
  target: 'esnext',
  minify: 'esbuild',
  cssCodeSplit: true,
  emptyOutDir: true,
  modulePreload: { polyfill: true },
  outDir,
  rollupOptions: {
    output: {
      // 极简但有效的拆分策略
      manualChunks(id) {
        // 保护所有Federation和React相关模块
        if (id.includes('__federation') || 
            id.includes('virtual:__federation') ||
            id.includes('/react/') || 
            id.includes('/react-dom/') ||
            id.includes('/react-router/')) {
          return
        }
        
        // 只拆分纯粹的MUI库
        if (id.includes('node_modules/@mui/material') ||
            id.includes('node_modules/@mui/system') ||
            id.includes('node_modules/@mui/base')) {
          // 最后一次检查：确保不是Federation或React
          if (id.includes('__federation') || id.includes('virtual:') || id.includes('/react/')) {
            return
          }
          return 'vendor-mui'
        }
        
        return
      }
    }
  },
  chunkSizeWarningLimit: 2000,
},
  }
})