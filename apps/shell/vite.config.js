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
    // 1. 外部化依赖：只列出你通过CDN引入了UMD包的库
    external: [
      'react',
      'react-dom',
      // 'react-router', // v6 无UMD，务必移除或注释掉！
      '@mui/material',
      '@emotion/react',
      '@emotion/styled'
    ],
    output: {
      // 2. 全局变量映射：告诉打包后的代码，从哪里找这些外部库
      globals: {
        'react': 'React', // 对应 window.React
        'react-dom': 'ReactDOM', // 对应 window.ReactDOM
        '@mui/material': 'window["mui"]', // 关键！MUI UMD 包暴露在 window.mui
        '@emotion/react': 'window["emotionReact"]', // 对应 window.emotionReact
        '@emotion/styled': 'window["emotionStyled"]' // 对应 window.emotionStyled
      },
      manualChunks(id) {
        // 1. 保护 Federation 运行时
        if (id.includes('@originjs/vite-plugin-federation') || id.includes('virtual:__federation')) {
          return;
        }
        // 2. 现在可以安全拆分其他大型库
        if (id.includes('/node_modules/echarts/')) {
          return 'vendor-echarts';
        }
        // 3. @mui/icons-material 和 @mui/system 继续打包，但可以尝试拆分
        if (id.includes('/node_modules/@mui/icons-material/')) {
          return 'vendor-mui-icons';
        }
        // 其他留在主包（包括react-router, @mui/x-*, 你的业务代码等）
        return;
      }
    }
  },
  chunkSizeWarningLimit: 1000,
}
  }
})