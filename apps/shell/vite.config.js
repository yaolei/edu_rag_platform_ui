import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig((mode) => {
  const isProd = mode === 'production' || process.env.NODE_ENV === 'production';
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
          '@workspace/shared-util': { singleton: true, requiredVersion: '1.0.0' },
          '@workspace/shared-components': { singleton: true, requiredVersion: '1.0.0' },
          'react': { singleton: true },
          'react-dom': { singleton: true },
          'react-router': { singleton: true },
        }
      }),
    ],
    optimizeDeps:{
      exclude:['eduAdmin/AdminApp']
    },
    server:{
      port: 5100,
      host:true
    },
    preview:{
      port: 5100,
      host:true
    },
    // build: {
    //   target: 'esnext',
    //   minify: 'esbuild',
    //   cssCodeSplit: true,
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

    //           // 其它第三方统一打 vendor
    //           return 'vendor';
    //         }

    //         /* ===== 2. 业务页面级按需加载 ===== */
    //         // 首屏必须：Dashboard / Login
    //         if (id.includes('/src/pages/Dashboard')) return 'page-dashboard';
    //         if (id.includes('/src/pages/Login')) return 'page-login';

    //         // 大模块——访问时再拉
    //         if (id.includes('/src/pages/KnowledgeManger')) return 'page-knowledge';
    //         if (id.includes('/src/pages/RobotChat')) return 'page-chat';
    //         if (id.includes('/src/pages/Settings')) return 'page-settings';
    //       },
    //     },
    //   },
    // // 把警告阈值先提高到 600 kB，等拆完再降回来
    // chunkSizeWarningLimit: 800,
    // },
      build: {
        target: 'esnext',
        minify: 'esbuild',
        cssCodeSplit: true,
        modulePreload: { polyfill: true },
        emptyOutDir: true,
        outDir,
        rollupOptions: {
          output: {
            manualChunks(id) {
              /* ===== 1. 把巨大的第三方库先拆出去 ===== */
              if (id.includes('node_modules')) {
                // React 全家桶
                if (id.includes('react-dom')) return 'react-dom';
                if (id.includes('react-router')) return 'react-router';

                // MUI 体系（icons + material + system + x-data-grid）
                if (id.includes('@mui')) return 'mui';
                if (id.includes('@mui/icons-material')) return 'mui-icons';
                if (id.includes('@mui/x-data-grid')) return 'mui-x';

                // 可视化
                if (id.includes('echarts')) return 'echarts';

                // Markdown + 语法高亮（> 500 kB）
                if (id.includes('react-markdown') ||
                    id.includes('react-syntax-highlighter') ||
                    id.includes('rehype-katex') ||
                    id.includes('remark-gfm') ||
                    id.includes('remark-math')) return 'markdown';
                return 'vendor';
              }
            },
          },
        },
        chunkSizeWarningLimit: 600,
      },
  }
})
