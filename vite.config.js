import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        headSpa: resolve(__dirname, 'head-spa.html'),
        masajeCorporal: resolve(__dirname, 'masaje-corporal.html'),
        limpiezaFacial: resolve(__dirname, 'limpieza-facial.html'),
        drenajeLinfatico: resolve(__dirname, 'drenaje-linfatico.html'),
        ritualCorporal: resolve(__dirname, 'ritual-corporal.html'),
      },
    },
  },
});
