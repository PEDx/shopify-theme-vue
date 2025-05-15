import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export function randomString(e: number) {
  e = e || 32;
  var t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678',
    a = t.length,
    n = '';
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
}

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
    __VUE_LIQUID_APP_ID__: `'app-${randomString(8)}'`,
  },
});

await server.listen();

server.printUrls();
