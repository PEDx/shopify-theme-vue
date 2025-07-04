import { createServer } from 'vite';
import { getAppId } from './utils.js';
import { ENTRY_FILE_NAME, OUTPUT_DIR, build_html, get_app_root_tag } from './build.js';
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
  const app_id = getAppId(true);

  let liquid = await build_html({ entry, appid: app_id });

  liquid = get_dev_liquid(app_id, liquid);

  const server = await createServer({
    mode: 'production',
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
  {
    "name": "dev section",
    "settings": [],
    "blocks": [],
    "presets": [
      {
        "name": "dev section",
        "blocks": []
      }
    ]
  }
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
