import { build as viteBuild, defineConfig, mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';
import {
  get_app_id,
  get_comment,
  get_liquid_comment,
  generate_build_banner,
  generate_release_liquid,
  generate_code_preview_liquid,
} from './utils';
import type { Rollup } from 'vite';
import { Script } from 'vm';
import { createRequire } from 'module';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { basename, extname, join } from 'path';
import { compilerOptions } from './transform.js';
import { renderToString } from 'vue/server-renderer';
import type { App } from 'vue';

export const ENTRY_FILE_NAME = 'index.ts';
export const OUTPUT_DIR = 'dist';

export const VUE_APP_FILENAME_PREFIX = 'vue';

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
          format: 'commonjs',
          exports: 'named',
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

export interface IBuildOptions {
  entry: string;
  liquid: boolean;
  output?: string;
}

export async function build_liquid_raw({ entry, appid }: { entry: string; appid: string }) {
  const { server_side_build_config } = get_build_config(entry, appid);

  const server_side_build_result = (await viteBuild(server_side_build_config)) as Rollup.RollupOutput;

  const server_side_build_chunk_output = server_side_build_result.output.find((output) => output.type === 'chunk');

  if (!server_side_build_chunk_output) return;

  global.require = createRequire(import.meta.url); // commonjs import for server side

  global.exports = {}; // custom exports for server side

  const script = new Script(`(() => {${server_side_build_chunk_output.code}return exports;})()`);

  const app: {
    default: App;
    schema: Record<string, any>;
  } = script.runInThisContext({ displayErrors: true });

  const html = await renderToString(app.default);

  return { html, schema: JSON.stringify(app.schema) };
}

export async function build({ entry, liquid = true }: IBuildOptions) {
  const appid = get_app_id();

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

  const { html, schema } = await build_liquid_raw({ entry, appid });

  const app_name = basename(entry);
  const banner = generate_build_banner();
  const build_banner = get_comment(banner);
  const liquid_comment = get_liquid_comment(banner);

  if (liquid) {
    const script_name = `${VUE_APP_FILENAME_PREFIX}-${app_name}.js`;
    const style_name = `${VUE_APP_FILENAME_PREFIX}-${app_name}.css`;
    const liquid_name = `${VUE_APP_FILENAME_PREFIX}-${app_name}.liquid`;

    const script_file_name = join(output_dir, script_name);
    const style_file_name = join(output_dir, style_name);
    const liquid_file_name = join(output_dir, liquid_name);

    const liquid_content = generate_release_liquid({ html, appid, script_name, style_name, schema });

    writeFileSync(script_file_name, build_banner.concat(client_script as string));
    writeFileSync(style_file_name, build_banner.concat(client_style as string));
    writeFileSync(liquid_file_name, liquid_comment.concat(liquid_content));
    return;
  }

  const final_html = generate_code_preview_liquid({
    html,
    script: client_script,
    style: client_style as string,
    appid,
  });

  writeFileSync(join(output_dir, 'index.html'), final_html);
}
