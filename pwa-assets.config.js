import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [192, 512],
      padding: 0.1,
      resizeOptions: {
        background: '#ea580c',
        fit: 'contain'
      }
    },
    apple: {
      sizes: [180],
      padding: 0.1,
      resizeOptions: {
        background: '#ea580c',
        fit: 'contain'
      }
    }
  },
  images: ['public/logo.png']
});
