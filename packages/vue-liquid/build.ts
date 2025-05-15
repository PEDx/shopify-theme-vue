import { build as viteBuild, defineConfig, mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';
import { getAppId } from './utils.js';
import type { Rollup } from 'vite';
import vm from 'vm';
import Module, { createRequire } from 'module';

const appid = getAppId();

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
    __VUE_LIQUID_APP_ID__: `'${appid}'`,
  },
});

const server_side_build_config = mergeConfig<UserConfig, UserConfig>(common_build_config, {
  build: {
    ssr: './main.ts',
    ssrEmitAssets: false,
    rollupOptions: {
      output: {
        dir: './example/simple-app/dist/server',
        format: 'cjs',
      },
    },
    write: false,
  },
});

const client_side_build_config = mergeConfig<UserConfig, UserConfig>(common_build_config, {
  build: {
    ssrManifest: true,
    rollupOptions: {
      input: './example/simple-app/main.ts',
      output: {
        format: 'umd',
        globals: {
          vue: 'Vue',
        },
        entryFileNames: '[name].js',
        dir: './example/simple-app/dist/client',
      },
    },
    cssCodeSplit: false,
    write: false,
  },
});


const generateSSRHTML = (html: string) => {
  return `<div id="${appid}" data-server-rendered="true">${html}</div>`;
}


async function build() {
  const server_side_build_result = (await viteBuild(server_side_build_config)) as Rollup.RollupOutput;

  // const client_side_build_result = (await viteBuild(client_side_build_config)) as Rollup.RollupOutput;

  const { renderToString }: typeof import('vue/server-renderer') = await import('vue/server-renderer');

  const server_side_build_result_output = server_side_build_result.output.find((output) => output.type === 'chunk');

  if (!server_side_build_result_output) return;

  global.require = createRequire(import.meta.url);
  global.module = {} as Module;

  const script = new vm.Script(server_side_build_result_output.code);

  const module = script.runInThisContext({ displayErrors: true });

  const html = await renderToString(module.app);

  const ssrHTML = generateSSRHTML(html);

  console.log(ssrHTML);
}

build();
