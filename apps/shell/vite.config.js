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
          'react': { singleton: true, eager: false },
          'react-dom': { singleton: true, eager: false },
          'react-router': { singleton: true, eager: false },
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
          // 精准的手动分块策略
            manualChunks(id) {
              // 1. 绝对保护：Federation 运行时和插件代码，必须留在主包
              if (id.includes('@originjs/vite-plugin-federation') || id.includes('virtual:__federation')) {
                return;
              }

              // 2. 只拆分一个确定完全独立、无任何React/MUI依赖的库：ECharts
              if (id.includes('/node_modules/echarts/')) {
                return 'vendor-echarts';
              }
              return;
            }
        }
      },

      
      chunkSizeWarningLimit: 1000,
    }
  }
})