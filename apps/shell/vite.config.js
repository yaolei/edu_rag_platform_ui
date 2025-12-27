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

  // 2. 绝对保护：React、ReactDOM、ReactRouter 核心。
  // *** 关键修改：移除对 `@emotion` 的绑定，它应该和 MUI 在一起 ***
  if (
    id.includes('/node_modules/react/') ||
    id.includes('/node_modules/react-dom/') ||
    id.includes('/node_modules/react-router/') ||
    id.includes('/node_modules/scheduler/')
  ) {
    return 'vendor-react';
  }

  // 3. 将所有 MUI 及其紧密依赖（@emotion, @mui/system）打包在一起，彻底避免循环依赖
  if (
    id.includes('/node_modules/@mui/') || // 包括 material, icons, system
    id.includes('/node_modules/@emotion/') // Emotion 现在是 MUI 的一部分
  ) {
    return 'vendor-mui-all'; // 合并成一个包
  }

  // 4. 拆分大型独立库：ECharts
  if (id.includes('/node_modules/echarts/')) {
    return 'vendor-echarts';
  }

  // 其他所有模块（包括 @mui/x-*、业务代码等）都留在主包
  return;
}
    }
  },
  chunkSizeWarningLimit: 1000,
}
  }
})