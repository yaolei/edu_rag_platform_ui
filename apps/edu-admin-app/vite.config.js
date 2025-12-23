import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import federation from '@originjs/vite-plugin-federation'


const outDir = process.env.BUILD_OUT_DIR || 'dist'
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'eduAdmin',
      filename: 'eduAdminEntry.js',
      exposes: {
        './AdminApp': './src/App.jsx',
      },
      shared: {
        '@workspace/shared-util': { singleton: true, requiredVersion: '1.0.0' },
        '@workspace/shared-components': { singleton: true, requiredVersion: '1.0.0' },
        'react': { singleton: true},
        'react-dom': { singleton: true },
      }
    }),
  ],

  server: {
    cors: true,
    host: true,
    port: 5002,
    // 额外保险：确保 dev server 对所有请求设置 CORS header
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          return res.end()
        }
        next()
      })
    }
  },
  preview: {
    port: 5002,
    host: true
  },
    // build: {
    //   target: 'esnext',
    //   minify: 'esbuild',
    //   cssCodeSplit: false,
    //   modulePreload: { polyfill: true },
    //   emptyOutDir: true,
    //   outDir,
    //   rollupOptions: {
    //     output: {
    //       manualChunks(id) {
    //         /* ===== 1. 把巨大的第三方库先拆出去 ===== */
    //         if (id.includes('node_modules')) {
    //           // React 全家桶
    //           if (id.includes('react-dom')) return 'react-dom';
    //           if (id.includes('react-router')) return 'react-router';

    //           // MUI 体系（icons + material + system + x-data-grid）
    //           if (id.includes('@mui')) return 'mui';
    //           if (id.includes('@mui/icons-material')) return 'mui-icons';
    //           if (id.includes('@mui/x-data-grid')) return 'mui-x';

    //           // 可视化
    //           if (id.includes('echarts')) return 'echarts';

    //           // Markdown + 语法高亮（> 500 kB）
    //           if (id.includes('react-markdown') ||
    //               id.includes('react-syntax-highlighter') ||
    //               id.includes('rehype-katex') ||
    //               id.includes('remark-gfm') ||
    //               id.includes('remark-math')) return 'markdown';
    //           return 'vendor';
    //         }
    //       },
    //     },
    //   },

    // chunkSizeWarningLimit: 600,
    // },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      modulePreload: { polyfill: true },
      emptyOutDir: true,
      outDir
    },
})