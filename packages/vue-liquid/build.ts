import { build as viteBuild, defineConfig, mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';
import { getAppId } from './utils';
import type { Rollup } from 'vite';
import { Script } from 'vm';
import { createRequire } from 'module';
import type { Module } from 'module';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { basename, extname, join } from 'path';

export const ENTRY_FILE_NAME = 'main.ts';
export const OUTPUT_DIR = 'dist';

export const LIQUID_ASSETS_PREFIX = 'vue';

export const build_plugins = [tailwindcss(), vue()];

const get_build_config = (app_dir: string, appid: string) => {
  const common_build_config = defineConfig({
    mode: 'production',
    plugins: build_plugins,
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        input: join(app_dir, ENTRY_FILE_NAME),
        external: ['vue'],
      },
    },
    define: {
      __VUE_LIQUID_APP_ID__: `'${appid}'`,
    },
  });

  const server_side_build_config = mergeConfig<UserConfig, UserConfig>(common_build_config, {
    build: {
      ssr: join(app_dir, ENTRY_FILE_NAME),
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

const get_comment = (comment: string) => {
  return `/**
${comment}
*/\n`;
};

const generate_build_banner = () => {
  return `*  Build Date ${new Date().toLocaleString()}`;
};

const generate_html = ({
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
  return `<!DOCTYPE html>
<html>
  <head>
    <title>vue liquid app</title>
    <style>${style}</style>
  </head>
  <body>
    <div id="${appid}" data-server-rendered="true">${html}</div>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script type="text/javascript">${script}</script>
  </body>
</html>
`;
};

const generate_liquid = ({ html, appid }: { html: string; appid: string }) => {
  return `


  `;
};

export async function build(app_dir: string, build_liquid: boolean = true) {
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

  const script = new Script(server_side_build_chunk_output.code);

  const app = script.runInThisContext({ displayErrors: true });

  const html = await renderToString(app);
  const client_script = client_side_build_chunk_output?.code;
  const client_style = client_side_build_style_output?.source;

  const output_dir = join(app_dir, OUTPUT_DIR);
  if (!existsSync(output_dir)) {
    mkdirSync(output_dir, { recursive: true });
  }

  const app_name = basename(app_dir);
  const build_banner = get_comment(generate_build_banner());

  console.log(build_banner);

  if (build_liquid) {
    const script_file = join(output_dir, `${LIQUID_ASSETS_PREFIX}-${app_name}.js`);
    const style_file = join(output_dir, `${LIQUID_ASSETS_PREFIX}-${app_name}.css`);
    const liquid_file = join(output_dir, `${LIQUID_ASSETS_PREFIX}-${app_name}.liquid`);

    writeFileSync(script_file, client_script as string);
    writeFileSync(style_file, client_style as string);
    writeFileSync(liquid_file, generate_liquid({ html, appid }));
    return;
  }

  const final_html = generate_html({
    html,
    script: client_script,
    style: client_style as string,
    appid,
  });

  writeFileSync(join(output_dir, 'index.html'), final_html);
}
