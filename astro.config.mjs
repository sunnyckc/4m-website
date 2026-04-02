// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://sunnyckc.github.io',
  base: '/4m-website',
  integrations: [tailwind()],
});
