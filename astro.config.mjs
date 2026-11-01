// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  image: {
    // Remote images allowed for optimisation: Instagram posts from the Behold feed (see BEHOLD_FEED_URL in
    // src/config.ts). Check the image host of the real feed when switching it on.
    // EXTRA_IMAGE_HOST (env, optional) adds one more host, e.g. a local mock feed for testing.
    remotePatterns: [
      { protocol: 'https', hostname: 'behold.pictures' },
      { protocol: 'https', hostname: '**.behold.pictures' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      ...(process.env.EXTRA_IMAGE_HOST ? [{ hostname: process.env.EXTRA_IMAGE_HOST }] : []),
    ],
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
