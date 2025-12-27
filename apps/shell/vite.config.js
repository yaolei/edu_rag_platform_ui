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
      host: true
    },
    preview: {
      port: 5100,
      host: true
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      emptyOutDir: true,
      modulePreload: { 
        polyfill: true,
        // 强制预加载 Federation 模块
        resolveDependencies: (url, deps, context) => {
          // 确保 Federation 模块优先加载
          const federationDeps = deps.filter(dep => 
            dep.includes('__federation') || 
            dep.includes('virtual:__federation')
          )
          return [...federationDeps, ...deps.filter(d => !federationDeps.includes(d))]
        }
      },
      outDir,
      rollupOptions: {
        output: {
          // 关键：排除 Federation 相关模块
          manualChunks(id) {
            // 跳过所有 Federation 相关模块 - 它们必须保持在一起
            if (id.includes('__federation') || 
                id.includes('virtual:__federation') ||
                id.includes('@originjs/vite-plugin-federation')) {
              return
            }
            
            // 只拆分 MUI，其他全部保持原样
            if (id.includes('node_modules') && id.includes('@mui')) {
              return 'vendor-mui'
            }
            // 其他所有依赖都留在主包中
          },
          // 确保共享模块有正确的命名
          chunkFileNames(chunkInfo) {
            if (chunkInfo.name.includes('__federation_shared')) {
              return 'assets/__federation_shared_[hash].js'
            }
            return 'assets/[name]-[hash].js'
          }
        },
        // 确保 Federation 模块不会被 tree-shake
        treeshake: {
          moduleSideEffects: 'no-external',
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false
        }
      },
      chunkSizeWarningLimit: 1000,
    },
  }
})