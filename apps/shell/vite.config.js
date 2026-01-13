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
          'react': { 
            singleton: true, 
            eager: false,
            requiredVersion: '19.2.0' // 改为精确版本
          },
          'react-dom': { 
            singleton: true, 
            eager: false,
            requiredVersion: '19.2.0' // 改为精确版本
          },
          'react-router': { 
            singleton: true, 
            eager: false,
            requiredVersion: '7.9.6' // 改为精确版本
          },
          '@workspace/shared-util': { 
            singleton: true, 
            requiredVersion: '1.0.0', 
            eager: false
          },
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
      outDir,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // **【安全护栏】必须第一条：绝对排除所有Federation相关代码**
            // 确保插件对共享依赖的完整控制，这是页面能运行的基础。
            if (
              id.includes('@originjs/vite-plugin-federation') ||
              id.includes('virtual:__federation') ||
              id.includes('__federation_shared')
            ) {
              return;
            }

            // **【安全护栏】必须第二条：排除已配置的共享依赖**
            // 根据路径特征，确保 react, react-dom, react-router 不被此函数分块。
            if (
              id.includes('/node_modules/react/index.js') ||
              id.includes('/node_modules/react-dom/') ||
              id.includes('/node_modules/react-router/')
            ) {
              return;
            }

            // **【精准拆分】对已知的、独立的大型库进行分块**
            // 这些是主包5MB体积的主要贡献者，且不影响共享依赖。
            if (id.includes('/node_modules/@mui/')) {
              return 'vendor-mui'; // Material-UI 全家桶
            }
            if (id.includes('/node_modules/echarts/')) {
              return 'vendor-echarts';
            }
            if (id.includes('/node_modules/katex/')) {
              return 'vendor-katex';
            }
            if (id.includes('/node_modules/react-syntax-highlighter/') ||
                id.includes('/node_modules/react-markdown/')) {
              return 'vendor-markdown'; // Markdown 相关套件
            }
            // 其他如 axios, dayjs, redux 等库体积较小，可以留在主包或由Rollup自动处理。
            // 不再使用“vendor-other”打包所有剩余项，避免产生新的依赖混乱。
          }
        }
      },
      chunkSizeWarningLimit: 1000 // 恢复合理阈值
    }
  }
})