import { createServer } from 'vite';
import { getAppId } from './utils.js';
import { ENTRY_FILE_NAME, OUTPUT_DIR, build_html } from './build.js';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { compilerOptions } from './transform.js';

const get_dev_index_html = (app_id: string) => {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + Vue + TS</title>
  </head>
  <body>
    <div id="${app_id}"></div>
    <script type="module" src="/${ENTRY_FILE_NAME}"></script>
  </body>
</html>
`;
};

export interface IDevOptions {
  entry: string;
}

export const dev = async ({ entry }: IDevOptions) => {
  const app_id = getAppId(true);
  const index_html = get_dev_index_html(app_id);

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
            const url = req.url;
            if (url === '/') {
              res.end(index_html);
              return;
            }
            next();
          });
        },
      },
    ],
    server: {
      port: 3000,
      cors: true,
      watch: {
        ignored: ['node_modules', OUTPUT_DIR],
      },
      open: false,
    },
    define: {
      __VUE_LIQUID_APP_ID__: `'${app_id}'`,
    },
  });

  await server.listen();

  server.printUrls();
};
