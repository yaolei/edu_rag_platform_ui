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
    // 关键配置：告诉 Rollup 哪些模块是外部的，以及如何找到它们
    external: ['react', 'react-dom', 'react-router', '@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
    output: {
      // 为这些外部依赖提供全局变量名，让代码知道从 window 的哪个属性上获取
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'react-router': 'ReactRouter', // 注意：React Router v6 可能没有现成UMD，需调整
        '@mui/material': 'window["@mui/material"]',
        '@mui/icons-material': 'window["@mui/icons-material"]',
        '@emotion/react': 'window["@emotion/react"]',
        '@emotion/styled': 'window["@emotion/styled"]'
      },
      manualChunks(id) {
        // 1. 保护 Federation 运行时
        if (id.includes('@originjs/vite-plugin-federation') || id.includes('virtual:__federation')) {
          return;
        }
        // 2. 现在 React 和 MUI 已是外部依赖，可以安全地拆分其他大型库
        if (id.includes('/node_modules/echarts/')) {
          return 'vendor-echarts';
        }
        // 可以将 dayjs、axios 等也拆分出来，现在更安全了
        if (id.includes('/node_modules/dayjs/')) {
          return 'vendor-dayjs';
        }
        if (id.includes('/node_modules/axios/')) {
          return 'vendor-axios';
        }
        // 其他所有模块（包括你的业务代码、@mui/x-* 等）留在主包
        return;
      }
    }
  },
  chunkSizeWarningLimit: 1000,
}
  }
})