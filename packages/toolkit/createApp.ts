import type { Component } from 'vue';
import { createSSRApp } from 'vue';

export function createApp(rootComponent: Component, rootProps?: Record<string, unknown> | null) {
  const isSSR = import.meta.env.SSR;
  const app = createSSRApp(rootComponent, rootProps);

  if (!isSSR) {
    app.mount(`#${__VUE_LIQUID_APP_ID__}`, true);
    return;
  }

  return app;
}
