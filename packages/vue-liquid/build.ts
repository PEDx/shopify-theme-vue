import { build as viteBuild, defineConfig, mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';
import { getAppId } from './utils.js';
import type { Rollup } from 'vite';
import vm from 'vm';
import Module, { createRequire } from 'module';
import fs from 'fs';
import { extname } from 'path';

const get_build_config = (app_dir: string, appid: string) => {
  const common_build_config = defineConfig({
    mode: 'production',
    plugins: [tailwindcss(), vue()],
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        input: app_dir,
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
      cssCodeSplit: true,
      rollupOptions: {
        output: {
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
        output: {
          format: 'umd',
          globals: {
            vue: 'Vue',
          },
          entryFileNames: '[name].js',
        },
      },
      write: false,
    },
  });

  return {
    common_build_config,
    server_side_build_config,
    client_side_build_config,
  };
};

const generateClientHTML = ({
  html,
  script,
  style,
  appid,
}: {
  html: string;
  script?: string;
  style?: string;
  appid: string;
}) => {
  const time = new Date().toISOString();
  return `<!DOCTYPE html>
<html>
  <head>
    <title>vue liquid app</title>
    <style>${style}</style>
  </head>
  <body>
    <!-- build time: ${time} -->
    <div id="${appid}" data-server-rendered="true">${html}</div>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script type="text/javascript">${script}</script>
  </body>
</html>
`;
};

export async function build(app_dir: string) {
  const appid = getAppId();

  const { server_side_build_config, client_side_build_config } = get_build_config(app_dir, appid);

  const server_side_build_result = (await viteBuild(server_side_build_config)) as Rollup.RollupOutput;

  const client_side_build_result = (await viteBuild(client_side_build_config)) as Rollup.RollupOutput;

  const { renderToString }: typeof import('vue/server-renderer') = await import('vue/server-renderer');

  const server_side_build_chunk_output = server_side_build_result.output.find((output) => output.type === 'chunk');

  const client_side_build_chunk_output = client_side_build_result.output.find((output) => output.type === 'chunk');

  const client_side_build_style_output = client_side_build_result.output.find(
    (output) => output.type === 'asset' && extname(output.fileName) === '.css',
  ) as Rollup.OutputAsset;

  if (!server_side_build_chunk_output) return;

  global.require = createRequire(import.meta.url);
  global.module = {} as Module;

  const script = new vm.Script(server_side_build_chunk_output.code);

  const app = script.runInThisContext({ displayErrors: true });

  const html = await renderToString(app);
  const client_script = client_side_build_chunk_output?.code;
  const client_style = client_side_build_style_output?.source;

  const final_html = generateClientHTML({
    html,
    script: client_script,
    style: client_style as string,
    appid,
  });

  fs.writeFileSync('./index.html', final_html);
}
