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
          'react': { 
            singleton: true, 
            eager: false,
            requiredVersion: '19.2.0' // 改为精确版本
          },
          'react-dom': { 
            singleton: true, 
            eager: false,
            requiredVersion: '19.2.0' // 改为精确版本
          },
          'react-router': { 
            singleton: true, 
            eager: false,
            requiredVersion: '7.9.6' // 改为精确版本
          },
          '@workspace/shared-util': { 
            singleton: true, 
            requiredVersion: '1.0.0', 
            eager: false
          },
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
        outDir,
        rollupOptions: {
          output: {
            // 完全删除 manualChunks 函数，使用Rollup最原始的行为
          }
        },
        chunkSizeWarningLimit: 2000 // 暂时调高，避免警告干扰
      }
  }
})