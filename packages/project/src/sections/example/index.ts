import { createApp } from 'toolkit/createApp';
import App from './app.vue';

export default createApp(App);

export const schema = {
  name: 'Slideshow',
  tag: 'section',
  class: 'slideshow',
  limit: 1,
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Slideshow',
    },
  ],
  max_blocks: 5,
  blocks: [
    {
      name: 'Slide',
      type: 'slide',
      settings: [
        {
          type: 'image_picker',
          id: 'image',
          label: 'Image',
        },
      ],
    },
  ],
  presets: [
    {
      name: 'Slideshow',
      settings: {
        title: 'Slideshow',
      },
      blocks: [
        {
          type: 'slide',
        },
        {
          type: 'slide',
        },
      ],
    },
  ],
  locales: {
    en: {
      title: 'Slideshow',
    },
    fr: {
      title: 'Diaporama',
    },
  },
  enabled_on: {
    templates: ['*'],
    groups: ['footer'],
  },
};
