import { createServer } from 'vite';
import { getAppId } from './utils.js';
import { build_plugins, OUTPUT_DIR } from './build.js';

export const dev = async (app_dir: string) => {
  const server = await createServer({
    root: app_dir,
    plugins: build_plugins,
    server: {
      port: 3000,
      watch: {
        ignored: ['node_modules', OUTPUT_DIR],
      },
    },
    define: {
      __VUE_LIQUID_APP_ID__: `'${getAppId(true)}'`,
    },
  });

  await server.listen();

  server.printUrls();
};
