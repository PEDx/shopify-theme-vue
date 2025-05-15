import { build as viteBuild, defineConfig, mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';
import { randomString } from './utils';

export const common_build_config = defineConfig({
  mode: 'production',
  root: './example/simple-app/',
  plugins: [tailwindcss(), vue()],
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      external: ['vue'],
    },
  },
  define: {
    '__VUE_LIQUID_APP_ID__': `'app-${randomString(8)}'`,
  }
});

const server_side_build_config = mergeConfig<UserConfig, UserConfig>(common_build_config, {
  build: {
    ssr: './main.ts',
    rollupOptions: {
      output: {
        dir: './example/simple-app/dist/server',
      },
    },
  },
});

const client_side_build_config = mergeConfig<UserConfig, UserConfig>(common_build_config, {
  build: {
    ssrManifest: true,
    rollupOptions: {
      output: {
        format: 'umd',
        globals: {
          vue: 'Vue',
        },
        dir: './example/simple-app/dist/client',
      },
    },
    cssCodeSplit: false,
  },
});

function build() {
  viteBuild(server_side_build_config);
  viteBuild(client_side_build_config);
}

build();
