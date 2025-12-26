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
            eager: true
          },
          'react-dom': { 
            singleton: true,
            eager: true 
          },
        }
    }),
  ],
  optimizeDeps:{
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
  build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      modulePreload: { polyfill: true },
      emptyOutDir: true,
      outDir,
  },
})