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
      // 精准的手动分块策略
      manualChunks(id) {
        // 1. 绝对保护：Federation 运行时和插件代码，必须留在主包
        if (id.includes('@originjs/vite-plugin-federation') || id.includes('virtual:__federation')) {
          return;
        }

        // 2. 绝对保护：React 核心及其直接运行时，必须在一起[citation:9]
        // 使用精确路径匹配，防止 MUI 包里包含的 react 字符串被误判
        if (
          id.includes('/node_modules/react/') ||
          id.includes('/node_modules/react-dom/') ||
          id.includes('/node_modules/react-router/') ||
          id.includes('/node_modules/scheduler/') ||
          id.includes('/node_modules/@emotion/') // MUI 的样式运行时，与React实例深度绑定
        ) {
          return 'vendor-react';
        }

        // 3. 拆分 MUI 核心组件和图标库[citation:4]
        if (id.includes('/node_modules/@mui/material/')) {
          return 'vendor-mui-core';
        }
        if (id.includes('/node_modules/@mui/icons-material/')) {
          // 图标库也可以考虑放入 vendor-mui-core，这里按需选择
          return 'vendor-mui-core'; 
        }

        // 4. 拆分 MUI 独立的样式系统
        if (id.includes('/node_modules/@mui/system/')) {
          return 'vendor-mui-system';
        }

        // 5. 拆分大型独立库：ECharts
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