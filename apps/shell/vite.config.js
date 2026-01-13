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
            // *** 核心：将所有 Federation 相关的代码（包括共享依赖）都排除在自定义分块之外 ***
            // 这确保了插件能独立管理 React、ReactDOM 等共享包的打包和加载。
            if (id.includes('@originjs/vite-plugin-federation') || 
                id.includes('virtual:__federation') ||
                id.includes('__federation_shared') || // 明确排除共享依赖块
                id.includes('shared') && id.includes('node_modules')) { // 根据路径特征排除
              return;
            }
            
            // 以下仅对非Federation、非共享依赖的普通依赖进行分块
            // 1. MUI（最大的部分）
            if (id.includes('/node_modules/@mui/')) {
              return 'vendor-mui';
            }
            // 2. ECharts
            if (id.includes('/node_modules/echarts/')) {
              return 'vendor-echarts';
            }
            // 3. KaTeX
            if (id.includes('/node_modules/katex/')) {
              return 'vendor-katex';
            }
            // 4. 其他第三方依赖可以打包在一起，或继续细分
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