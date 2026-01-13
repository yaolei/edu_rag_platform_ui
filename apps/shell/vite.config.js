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
          // 1. 最重要的修改：使用函数形式，强制对所有 node_modules 进行分包
          manualChunks(id) {
            // 1.1 核心保护：所有 Federation 相关代码必须留在主包，保证运行时稳定。
            if (id.includes('@originjs/vite-plugin-federation') || 
                id.includes('virtual:__federation')) {
              return; // 返回 undefined，使其保留在主包中
            }

            // 1.2 强制分包逻辑：如果模块在 node_modules 中，就按其包名拆分
            if (id.includes('node_modules')) {
              // 提取包名。例如：/node_modules/@mui/material/index.js -> @mui/material
              const match = id.match(/[\\/]node_modules[\\/](.+?)([\\/]|$)/);
              if (match) {
                const packageName = match[1];
                // 将一些非常大或独立的包单独拆出，避免 vendor 过大
                if (packageName.startsWith('@mui') ||
                    packageName.startsWith('echarts') ||
                    packageName.startsWith('katex') ||
                    packageName.startsWith('react-syntax-highlighter')) {
                  return `vendor-${packageName.replace('@', '').replace(/[\\/]/g, '-')}`;
                }
                // 其他所有第三方包打到一个 vendor 包里
                return 'vendor';
              }
            }
            // 1.3 业务代码默认留在主包，也可根据 src/ 路径进一步拆分
            // if (id.includes('src/')) { ... }
          },
          // 2. 降低警告阈值，让你能感知到任何大文件
          chunkSizeWarningLimit: 500,
        }
      }
    }
  }
})