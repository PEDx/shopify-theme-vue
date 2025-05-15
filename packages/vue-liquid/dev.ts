import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { getAppId } from './utils.js';

const server = await createServer({
  root: './example/simple-app/',
  plugins: [tailwindcss(), vue()],
  server: {
    port: 3000,
    watch: {
      ignored: ['node_modules', 'dist', 'build'],
    },
  },
  define: {
    __VUE_LIQUID_APP_ID__: `'${getAppId(true)}'`,
  },
});

await server.listen();

server.printUrls();
