import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite'; // Importante: v4 usa Vite
import react from '@astrojs/react';

export default defineConfig({
  // ELIMINA tailwind() de integrations si estaba ahí
  integrations: [react()], 
  vite: {
    plugins: [tailwindcss()],
  },
});