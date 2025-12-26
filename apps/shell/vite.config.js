import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import federation from '@originjs/vite-plugin-federation'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const outDir = process.env.BUILD_OUT_DIR || 'dist'
  const analyze = process.env.ANALYZE === 'true'
  
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
           '@workspace/shared-util': { 
            singleton: true, 
            requiredVersion: '1.0.0',
            eager: false
          },
          '@workspace/shared-components': { 
            singleton: true, 
            requiredVersion: '1.0.0',
            eager: false
          },
          'react': { 
            singleton: true,
            eager: false
          },
          'react-dom': { 
            singleton: true,
            eager: false 
          },
          'react-router': { 
            singleton: true,
            eager: false 
          },
        }
      }),
      analyze && visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),

    optimizeDeps:{
      exclude:['eduAdmin/AdminApp'],
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
      ],
    },
    server:{
      port: 5100,
      host:true
    },
    preview:{
      port: 5100,
      host:true
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      modulePreload: { 
        polyfill: true,
        resolveDependencies: (url, deps, context) => {
          // 优化模块预加载，只预加载小文件
          if (url.includes('node_modules') && url.includes('@mui')) {
            return []
          }
          return deps
        }
      },
      emptyOutDir: true,
      outDir,
      rollupOptions: {
        output: {
          // 手动分块配置 - 这是减少主包大小的关键
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // MUI 相关
              if (id.includes('@mui') || id.includes('@emotion')) {
                return 'vendor-mui'
              }
              // React 相关
              if (id.includes('react') || id.includes('redux')) {
                return 'vendor-react'
              }
              // 其他第三方库
              return 'vendor-other'
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
      },
      chunkSizeWarningLimit: 1500,
      sourcemap: false,
    },
  }
})