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
      rollupOptions: {
        output: {
          manualChunks(id) {
            // **核心原则：所有 Federation 插件相关的代码，绝对不碰，留在主包。**
            if (id.includes('@originjs/vite-plugin-federation') ||
                id.includes('virtual:__federation') ||
                id.includes('__federation_shared')) {
              return;
            }

            // **关键步骤：识别并保护 Shared 依赖**
            // 如果模块是我们在 `shared` 中声明的依赖，也排除在分块外。
            if (id.includes('node_modules')) {
              // 使用路径精确匹配，而不是包名前缀，避免误伤
              const libsToProtect = ['react/', 'react-dom/', 'react-router/'];
              for (const lib of libsToProtect) {
                if (id.includes(`/node_modules/${lib}`)) {
                  // 返回 undefined，让 Federation 插件接管
                  return;
                }
              }

              // **只对以下确认不会破坏共享依赖的、体积巨大的库进行分块**
              // 1. MUI 系列
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
              // 4. Markdown 和语法高亮相关
              if (id.includes('/node_modules/react-syntax-highlighter/') ||
                  id.includes('/node_modules/react-markdown/')) {
                return 'vendor-markdown';
              }
            }
          },
          chunkSizeWarningLimit: 500
        }
      }
    }
  }
})