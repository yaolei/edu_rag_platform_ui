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
          manualChunks(id) {
            // 1. 核心框架必须在一起
            if (id.includes('/node_modules/react/') || 
                id.includes('/node_modules/react-dom/') ||
                id.includes('/node_modules/react-router/')) {
              return 'vendor-react';
            }
            
            // 2. MUI是最大的，必须单独分块
            if (id.includes('/node_modules/@mui/')) {
              return 'vendor-mui';
            }
            
            // 3. 图表库单独分块
            if (id.includes('/node_modules/echarts/')) {
              return 'vendor-echarts';
            }
            
            // 4. KaTeX数学公式库单独分块
            if (id.includes('/node_modules/katex/')) {
              return 'vendor-katex';
            }
            
            // 5. 其他所有node_modules包放一起
            if (id.includes('node_modules')) {
              return 'vendor-other';
            }
          }
        }
      },

      
      chunkSizeWarningLimit: 1000,
    }
  }
})