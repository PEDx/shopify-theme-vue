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
import { compilerOptions } from './transform.js';
import { renderToString } from 'vue/server-renderer';

export const ENTRY_FILE_NAME = 'main.ts';
export const OUTPUT_DIR = 'dist';

export const LIQUID_ASSETS_PREFIX = 'vue';

const get_build_config = (app_dir: string, appid: string) => {
  const common_build_config = defineConfig({
    mode: 'production',
    plugins: [
      vue({
        template: {
          compilerOptions,
        },
      }),
    ],
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
      cssMinify: false,
      rollupOptions: {
        output: {
          format: 'cjs',
        },
      },
      write: false,
    },
  });

  const client_side_build_config = mergeConfig<UserConfig, UserConfig>(common_build_config, {
    plugins: [tailwindcss()],
    build: {
      ssrManifest: true,
      rollupOptions: {
        output: {
          format: 'umd',
          globals: {
            vue: 'Vue',
          },
          name: appid,
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

const get_liquid_comment = (comment: string) => {
  return `{% comment %}
${comment}
{% endcomment %}\n`;
};

const generate_build_banner = () => {
  return `*  build date ${new Date().toLocaleString()}`;
};

export const get_app_root_tag = (appid: string, html: string) => {
  return `<div id="${appid}" data-server-rendered="true">${html}</div>`;
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
    ${get_app_root_tag(appid, html)}
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script type="text/javascript">${script}</script>
  </body>
</html>
`;
};

const generate_dev_liquid = ({
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
  return `
    <style>${style}</style>
    ${get_app_root_tag(appid, html)}
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script type="text/javascript">${script}</script>
`;
};

const generate_liquid = ({
  html,
  appid,
  script_name,
  style_name,
}: {
  html: string;
  appid: string;
  script_name: string;
  style_name: string;
}) => {
  return `<link href="{{ "${style_name}" | asset_url }}" rel="stylesheet" type="text/css" >
${get_app_root_tag(appid, html)}
<script src="{{ "${script_name}" | asset_url }}" type="text/javascript" defer fetchpriority="high"></script>`;
};

export interface IBuildOptions {
  entry: string;
  liquid: boolean;
}

export async function build_html({ entry, appid }: { entry: string; appid: string }) {
  const { server_side_build_config } = get_build_config(entry, appid);

  const server_side_build_result = (await viteBuild(server_side_build_config)) as Rollup.RollupOutput;

  const server_side_build_chunk_output = server_side_build_result.output.find((output) => output.type === 'chunk');

  if (!server_side_build_chunk_output) return;

  global.require = createRequire(import.meta.url);
  global.module = {} as Module;

  const script = new Script(server_side_build_chunk_output.code);

  const app = script.runInThisContext({ displayErrors: true });

  const html = await renderToString(app);

  console.log('html =>', global.module);

  return html;
}

export async function build({ entry, liquid = true }: IBuildOptions) {
  const appid = getAppId();

  const { client_side_build_config } = get_build_config(entry, appid);

  const client_side_build_result = (await viteBuild(client_side_build_config)) as Rollup.RollupOutput;

  const client_side_build_chunk_output = client_side_build_result.output.find((output) => output.type === 'chunk');

  const client_side_build_style_output = client_side_build_result.output.find(
    (output) => output.type === 'asset' && extname(output.fileName) === '.css',
  ) as Rollup.OutputAsset;

  if (!client_side_build_chunk_output) return;

  const client_script = client_side_build_chunk_output?.code;
  const client_style = client_side_build_style_output?.source;

  const output_dir = join(entry, OUTPUT_DIR);
  if (!existsSync(output_dir)) {
    mkdirSync(output_dir, { recursive: true });
  }

  const html = await build_html({ entry, appid });

  const app_name = basename(entry);
  const banner = generate_build_banner();
  const build_banner = get_comment(banner);
  const liquid_comment = get_liquid_comment(banner);

  if (liquid) {
    const script_name = `${LIQUID_ASSETS_PREFIX}-${app_name}.js`;
    const style_name = `${LIQUID_ASSETS_PREFIX}-${app_name}.css`;
    const liquid_name = `${LIQUID_ASSETS_PREFIX}-${app_name}.liquid`;

    const script_file_name = join(output_dir, script_name);
    const style_file_name = join(output_dir, style_name);
    const liquid_file_name = join(output_dir, liquid_name);

    const liquid_content = generate_liquid({ html, appid, script_name, style_name });

    writeFileSync(script_file_name, build_banner.concat(client_script as string));
    writeFileSync(style_file_name, build_banner.concat(client_style as string));
    writeFileSync(liquid_file_name, liquid_comment.concat(liquid_content));
    return;
  }

  const final_html = generate_dev_liquid({
    html,
    script: client_script,
    style: client_style as string,
    appid,
  });

  writeFileSync(join(output_dir, 'index.html'), final_html);
}
