import type { Component } from 'vue';
import { createApp as createClientApp, createSSRApp } from 'vue';

export function createApp(rootComponent: Component, rootProps?: Record<string, unknown> | null) {
  const isSSR = import.meta.env.SSR;

  if (!isSSR) {
    return createClientApp(rootComponent, rootProps).mount(`#${__VUE_LIQUID_APP_ID__}`);
  }

  return createSSRApp(rootComponent, rootProps);
}
