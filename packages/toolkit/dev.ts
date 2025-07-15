import { createServer } from 'vite';
import { get_app_id, get_app_root_tag } from './utils.js';
import { ENTRY_FILE_NAME, OUTPUT_DIR, build_liquid_raw } from './build.js';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { compilerOptions } from './transform.js';
import { uploadShopifyFiles } from './shopify.js';

const get_dev_liquid = (app_id: string, liquid: string) => {
  return `${get_app_root_tag(app_id, liquid)}
    <script type="module" src="http://localhost:3000/${ENTRY_FILE_NAME}"></script>
`;
};
export interface IDevOptions {
  entry: string;
}

export const dev = async ({ entry }: IDevOptions) => {
  const app_id = get_app_id(true);

  const { html, schema } = await build_liquid_raw({ entry, appid: app_id });

  const liquid = get_dev_liquid(app_id, html);

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
              res.end(liquid);
              return;
            }
            next();
          });
        },
        async watchChange() {
          const start = Date.now();

          const upload_result = await uploadShopifyFiles({
            theme: {
              store: '',
              id: 0,
            },
            files: [
              {
                key: 'sections/dev.liquid',
                content:
                  liquid +
                  `{% schema %}
                   ${JSON.stringify(schema)}
                 {% endschema %}`,
              },
            ],
          });

          console.log('upload latency:', Date.now() - start, 'ms');

          console.log(upload_result);
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
