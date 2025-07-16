# 🧪 ThemeVue (WIP)

Vue to Shopify Theme Liquid - A powerful development tool that integrates Vue.js into Shopify's Liquid template system
with server-side rendering and optimal performance.

### Features

- Modern Stack: Built with Vue 3, TypeScript, Tailwind CSS, and Vite — providing a clean, maintainable, and future-proof
  development experience.

- Server-side Rendering: Renders Vue 3 components into Shopify Liquid templates for better SEO and first paint
  performance.

- Seamless Shopify Integration: Works with both new and legacy Shopify themes — no migration required.

- Built-in Component Library: Comes with a customizable component library designed for quick adaptation to your project
  needs.

### Roadmap

- ♿ Semantic and Accessible Component Integration Reference or integrate community-driven component libraries to
  provide a collection of reusable UI and business components that follow semantic HTML and web accessibility (a11y)
  best practices.

- 🔄 Vite Dev Integration for Shopify Theme Development Improve consistency between development and production
  environments by integrating Shopify theme development mode with Vite's dev server.

### Sections

You only need to define two exports in the entry file, and this module will be packaged as a valid section component.

```ts
// index.ts

import { createApp } from 'toolkit/createApp';
import { defineSectionSchema } from 'toolkit/defineSectionSchema'; // For better type inference
import App from './app.vue';

export const schema = defineSectionSchema({
  name: 'section',
  settings: [
    {
      type: 'text',
      id: 'text',
      label: 'Text',
      default: 'Hello World',
    },
  ],
  blocks: [],
  presets: [
    {
      name: 'section',
    },
  ],
});

export default createApp(App);
```

### Liquid In Vue

The `template` in `Vue SFC` goes through SSG and ultimately becomes a `.liquid` file. Therefore, when we need to add
Section Setting configurations or Shopify liquid data (such as products) in Vue templates, we can use the
`<liquid v-pre></liquid>` tag to wrap liquid syntax in Vue. The Vue compiler will not escape any code inside it.

You can also use the `liquid` attribute to quickly inject Liquid syntax into a tag. This will directly replace the
contents of the tag with the value of the attribute, which is essentially equivalent to using `v-html`.

**However, you cannot use any Vue syntax within this tag.**

**Note: Adding `v-pre` skips parsing of liquid code during the parse process and ensures Vue's VSCode plugins work
properly**

```html
<template>
  <h1>Example</h1>

  <h2 class="text-2xl lg:text-4xl lg:font-bold" liquid="{{ section.settings.title | upcase }}"></h2>

  <liquid v-pre tag="div">
    {% for block in section.blocks %}
    <div class="text-2xl lg:text-4xl lg:font-bold">{{ block.settings.title | upcase | append: 'test' }}</div>
    {% endfor %}
  </liquid>

  <div>{{ vue_data.title }}</div>
</template>

<script setup lang="ts">
  const vue_data = {
    title: 'Vue Data Example',
  };
</script>
```

### Integration

To quickly enhance the development experience, you can simply run the following command in the root directory of your existing Shopify theme project:
```bash
npx @shopify-theme-vue/toolkit init
```
The command will create an internal directory in the root, which contains all the `theme-vue` code. Then, update your development mode command accordingly.

```diff
# package.json

  "scripts": {
-    "dev": "shopify theme dev -s store -x package.json  -x locales/*.json --live-reload full-page --theme-editor-sync",
+    "dev": "@shopify-theme-vue/toolkit dev",
  },
```

Finally, add an environment file in the `internal` folder so that the toolkit knows which store to use for development.

```bash
# .env.local

SHOPIFY_STORE = your-store-name

SHOPIFY_THEME_ID = your-theme-id
```
### Status

🚧 This project is currently under active development. Stay tuned for installation instructions, usage examples, and
full documentation.
