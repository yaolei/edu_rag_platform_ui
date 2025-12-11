import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import federation from '@originjs/vite-plugin-federation'


let remotes = {
  eduAdmin: 'http://localhost:5002/assets/eduAdminEntry.js',
}

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      federation({
        name: 'shell',
        remotes: remotes,
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
    build: {
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
      modulePreload: false
    },
    server:{
      port: 5100,
      host:true
    },
    preview:{
      port: 5100,
      host:true
    }
  }
})
