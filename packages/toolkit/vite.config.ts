import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import nodeExternals from 'rollup-plugin-node-externals';

function externals() {
  return {
    ...nodeExternals(),
    name: 'node-externals',
    enforce: 'pre', // 关键是要在 vite 默认的依赖解析插件之前运行
    apply: 'build',
  } as unknown as Plugin;
}

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
  plugins: [externals()],
});
