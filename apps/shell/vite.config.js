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
        // 保留此逻辑，确保共享依赖优先加载
        resolveDependencies: (filename, deps) => {
          return deps.sort((a, b) => {
            if (a.includes('__federation_shared')) return -1;
            if (b.includes('__federation_shared')) return 1;
            return 0;
          });
        }
      },
      outDir,
      // 核心修改：删除整个 manualChunks 函数，改用 Rollup 更稳定的自动分包策略
      rollupOptions: {
        output: {
          // 这将激活 Rollup 内置的、基于动态导入和重复依赖检测的自动代码分割
          // 它会自动将 node_modules 中的大型依赖拆分成独立的 chunk
          manualChunks: undefined,
          // 可选：可以设置 chunk 大小阈值，进一步控制分割粒度
          chunkSizeWarningLimit: 500, // 将警告阈值降低到 500KB，促进更细粒度的分割
        }
      }
    }
  }
})