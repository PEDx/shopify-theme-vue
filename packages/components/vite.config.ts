import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';


export default defineConfig({
  build: {
    lib: {
      entry: './index.ts',
      formats: ['es'],
    },

    rollupOptions: {
      output: {
        dir: './dist',
        entryFileNames: '[name].js',
      },
    },
  },
  plugins: [vue(), tailwindcss()],
});
