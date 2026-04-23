// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.BASE_PATH || '/';
const site = process.env.SITE_URL;

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [tailwind(), react()],
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@public': path.resolve(__dirname, './public'),
      },
    },
  },
});
