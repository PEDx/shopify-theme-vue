import { dev } from 'toolkit';

dev({
  entry: './src/sections/example',
  theme: {
    id: process.env.SHOPIFY_THEME_ID || '',
    store: process.env.SHOPIFY_STORE || '',
  },
});
