import { createServer } from 'vite';
import { get_app_id, generate_dev_liquid } from './utils.js';
import { ENTRY_FILE_NAME, OUTPUT_DIR, build_liquid_raw } from './build.js';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { compilerOptions } from './transform.js';
import { uploadShopifyFiles, type IUploadOptions } from './shopify.js';

export interface IDevOptions {
  entry: string;
  theme: {
    id: string;
    store: string;
  };
}

const DEV_SERVER_PORT = 3000;

export const dev = async ({ entry, theme }: IDevOptions) => {
  const appid = get_app_id(true);

  const getLiquid = async () => {
    const { html, schema } = await build_liquid_raw({ entry, appid });

    const liquid = generate_dev_liquid({
      html,
      schema,
      appid,
      script_url: `http://localhost:${DEV_SERVER_PORT}/${ENTRY_FILE_NAME}`,
    });

    return liquid;
  };

  const syncFilesToShopify = async (files: IUploadOptions['files']) => {
    const start = performance.now();

    await uploadShopifyFiles({
      theme: theme,
      files,
    });

    console.log('upload latency:', performance.now() - start, 'ms');
  };

  const server = await createServer({
    root: entry,
    plugins: [
      vue({
        template: {
          compilerOptions,
        },
      }),
      tailwindcss(),
      {
        name: 'vue-liquid-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url !== '/') return next();
            res.end(await getLiquid());
          });
        },
        async watchChange() {
          const start = performance.now();

          const liquid = await getLiquid();

          console.log('getLiquid latency:', performance.now() - start, 'ms');

          syncFilesToShopify([
            { key: 'sections/dev.liquid', value: liquid },
          ]);
        },
        handleHotUpdate({ server }) {
          server.ws.send({
            type: 'custom',
            event: 'shopify:section:load',
            data: {},
          });
          return [];
        },
      },
    ],
    server: {
      port: DEV_SERVER_PORT,
      cors: true,
      watch: {
        ignored: ['node_modules', OUTPUT_DIR],
      },
      open: false,
    },
    define: {
      __VUE_LIQUID_APP_ID__: `'${appid}'`,
    },
  });

  await server.listen();

  server.printUrls();
};
