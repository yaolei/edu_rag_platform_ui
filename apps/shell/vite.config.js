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
      outDir,
      cssCodeSplit: true,
      minify: 'esbuild',
  rollupOptions: {
    output: {
      manualChunks(id) {
        // 1. 绝对核心：保护Federation运行时，使其不被分割
        if (id.includes('@originjs/vite-plugin-federation') || 
            id.includes('virtual:__federation')) {
          return;
        }

        // 2. 【精准打击】分离已知的、最大的、独立的库
        // 2.1 分离巨大的图标库（当前首要目标）
        if (id.includes('/node_modules/@mui/icons-material/')) {
          return 'vendor-mui-icons';
        }
        // 2.2 分离核心UI库
        if (id.includes('/node_modules/@mui/material/')) {
          return 'vendor-mui-core';
        }
        // 2.3 分离其他确定的大库
        if (id.includes('/node_modules/echarts/')) {
          return 'vendor-echarts';
        }
        if (id.includes('/node_modules/@mui/x-data-grid/')) {
          return 'vendor-mui-x-grid';
        }

        // 3. 到此为止！不再拆分其他库（如react, react-dom, react-router, katex, markdown等），避免任何潜在的依赖冲突。
        // 将它们和您的业务代码一起留在主包中，主包体积将在第一步优化后大幅减小。
      }
    }
  },
      // 暂时调高，避免警告干扰
      chunkSizeWarningLimit: 2500
    }
  }
})