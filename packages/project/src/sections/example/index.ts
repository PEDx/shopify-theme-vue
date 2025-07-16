import { createApp } from 'toolkit/createApp';
import { defineSectionSchema } from 'toolkit/defineSectionSchema';
import App from './app.vue';

export const schema = defineSectionSchema({
  name: 'dev section',
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
      name: 'dev section',
    },
  ],
});

export default createApp(App);
