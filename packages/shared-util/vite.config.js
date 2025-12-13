import { defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig (({mode}) => {
  const env = loadEnv(mode, path.resolve(__dirname), 'VITE_')
  return(
          {
      define: {
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
      },
      plugins: [react()],
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.js'),
          name: 'SharedUtil',
          formats: ['es', 'cjs'],
          fileName: (format) => `shared-util.${format === 'es' ? 'js' : 'cjs'}`
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            }
          }
        }
      }
    }
  )
})