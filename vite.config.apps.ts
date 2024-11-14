
import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';

const vueOptions = {
  template: {
    compilerOptions: {
      isCustomElement: tag => ['ninja-keys'].includes(tag),
    },
  },
};

export default defineConfig({
  plugins: [vue(vueOptions)],
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {},
      input: {
        widget: './widget.html',
        dashboard: './dashboard.html',
        v3app: './v3app.html',
        demo: './web-widget.html',
      },
    },
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      components: path.resolve('./app/javascript/dashboard/components'),
      next: path.resolve('./app/javascript/dashboard/components-next'),
      v3: path.resolve('./app/javascript/v3'),
      dashboard: path.resolve('./app/javascript/dashboard'),
      helpers: path.resolve('./app/javascript/shared/helpers'),
      shared: path.resolve('./app/javascript/shared'),
      survey: path.resolve('./app/javascript/survey'),
      widget: path.resolve('./app/javascript/widget'),
      assets: path.resolve('./app/javascript/dashboard/assets'),
    },
  },
});
