// apps/shell/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import federation from '@originjs/vite-plugin-federation'
import { visualizer } from 'rollup-plugin-visualizer';
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
            requiredVersion: '19.2.0'
          },
          'react-dom': { 
            singleton: true, 
            eager: false,
            requiredVersion: '19.2.0'
          },
          'react-router': { 
            singleton: true, 
            eager: false,
            requiredVersion: '7.9.6'
          },
          '@workspace/shared-util': { 
            singleton: true, 
            requiredVersion: '1.0.0', 
            eager: false
          },
        },
        filename: 'federation-entry.js'
      }),
       visualizer({
        filename: 'dist/stats.html', // 分析报告输出位置
        open: false, // 构建后不自动打开
        gzipSize: true, // 显示gzip后大小
        brotliSize: false, // 可选
      })
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