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
          '@workspace/shared-util': { singleton: true, requiredVersion: '1.0.0', eager: false },
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
      modulePreload: { 
        polyfill: true,
         resolveDependencies: (filename, deps) => {
          // 确保共享依赖先加载
          return deps.sort((a, b) => {
            if (a.includes('__federation_shared')) return -1;
            if (b.includes('__federation_shared')) return 1;
            return 0;
          });
        }
      },
      outDir,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 1. 不分割Federation运行时
            if (id.includes('@originjs/vite-plugin-federation') || 
                id.includes('virtual:__federation')) {
              return;
            }
            
            // 2. 让Federation共享依赖生成自己的chunk
            // 这会导致生成 __federation_shared_*.js 文件
            // 并且它们会被正确加载
            if (id.includes('/node_modules/react/') && !id.includes('/node_modules/react-dom/')) {
              return; // 让Federation处理
            }
            
            // 3. 拆分其他大库
            if (id.includes('/node_modules/@mui/')) {
              return 'vendor-mui';
            }
            
            if (id.includes('/node_modules/echarts/')) {
              return 'vendor-echarts';
            }
            
            if (id.includes('/node_modules/katex/')) {
              return 'vendor-katex';
            }
            
            // 4. 其他库放一起
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