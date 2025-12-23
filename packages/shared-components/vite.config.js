import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'SharedComponents',
      formats: ['es'],
      fileName: (format) => `shared-components.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'axios',
        'react-markdown',
        'react-syntax-highlighter',
        'rehype-katex',
        'remark-gfm',
        'remark-math',
        'katex'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})