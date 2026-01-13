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
        // 【安全红线】所有Federation相关代码必须留在主包，确保运行时稳定。
        if (id.includes('@originjs/vite-plugin-federation') || 
            id.includes('virtual:__federation')) {
          return;
        }

        // 【精准打击】仅分离已知的、完全独立的大型库，并严格按路径匹配
        // 1. 分离图标库 (修改后，此包将显著减小，但仍应分离)
        if (id.includes('/node_modules/@mui/icons-material/')) {
          return 'vendor-mui-icons';
        }
        // 2. 分离MUI核心
        if (id.includes('/node_modules/@mui/material/') && !id.includes('/node_modules/@mui/material/styles/')) {
          return 'vendor-mui-core';
        }
        // 3. 分离ECharts
        if (id.includes('/node_modules/echarts/')) {
          return 'vendor-echarts';
        }
        // 4. 分离MUI X Data Grid
        if (id.includes('/node_modules/@mui/x-data-grid/')) {
          return 'vendor-mui-x-grid';
        }
        
        // 其他所有依赖（包括 React、ReactDOM、React-Router、KaTeX、Redux等）全部留在主包。
        // 经过第一步优化后，主包体积将变得可以接受。
      }
    }
  },
      // 暂时调高，避免警告干扰
      chunkSizeWarningLimit: 1000
    }
  }
})