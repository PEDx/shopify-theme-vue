import { createApp } from 'toolkit/createApp';
import App from './app.vue';

export default createApp(App);

export const schema = {
  name: 'dev section',
  settings: [],
  blocks: [],
  presets: [
    {
      name: 'dev section',
      blocks: [],
    },
  ],
};
