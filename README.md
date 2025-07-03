# shopify-theme-vue

Vue to Shopify Liquid - A powerful development tool that integrates Vue.js into Shopify's Liquid template system with server-side rendering and optimal performance.

### Features
- 🧪 Modern Stack: Built with Vue 3, TypeScript, Tailwind CSS, and Vite — providing a clean, maintainable, and future-proof development experience.

- 🔥 Server-side Rendering: Renders Vue 3 components into Shopify Liquid templates for better SEO and first paint performance.

- 🛍️ Seamless Shopify Integration: Works with both new and legacy Shopify themes — no migration required.

- 🧩 Built-in Component Library: Comes with a customizable component library designed for quick adaptation to your project needs.

### Roadmap
- ♿ Semantic and Accessible Component Integration
Reference or integrate community-driven component libraries to provide a collection of reusable UI and business components that follow semantic HTML and web accessibility (a11y) best practices.

- 🔄 Vite Dev Integration for Shopify Theme Development
Improve consistency between development and production environments by integrating Shopify theme development mode with Vite's dev server.

- 🔗 Passing Shopify Theme Data and Views into Vue Templates
Enable passing store data, editor config, and existing Liquid views (like snippets or sections) into Vue components — inspired by [Storefront Web Components](https://shopify.dev/docs/api/storefront-web-components), using special wrapper components to expose external content to Vue.


### Liquid And Vue
The `template` in `Vue SFC` goes through SSG and ultimately becomes a `.liquid` file.
Therefore, when we need to add Section Setting configurations or Shopify liquid data (such as products) in Vue templates,
we can use the `<liquid v-pre></liquid>` tag to wrap liquid syntax in Vue. The Vue compiler will not escape any code inside it.

**However, you cannot use any Vue syntax within this tag.**

**Note: Adding `v-pre` skips parsing of liquid code during the parse process and ensures Vue's VSCode plugins work properly**

```html
<template>
  <h1>Example</h1>

  <liquid v-pre tag="div">
    {% for block in section.blocks %}
    <div class="text-2xl lg:text-4xl lg:font-bold">
      {{ block.settings.title | upcase | append: 'test' }}
    </div>
    {% endfor %}
  </liquid>

  <div>
    {{ vue_data.title }}
  </div>
</template>

<script setup lang="ts">
const vue_data = {
  title: 'Vue Data Example',
};
</script>

```

### Interface
```bash
# init project

npx @shopify-theme-vue/toolkit init

> pure vue project

> vue project with shopify theme

# run project

cd your/project

npm install

npm run dev

# build project

npm run deploy

# deploy project

npm run deploy
```

### Status
🚧 This project is currently under active development.
Stay tuned for installation instructions, usage examples, and full documentation.
