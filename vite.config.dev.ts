
import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import { ViteDevServer } from 'vite';
import fs from 'fs';

const backend = 'http://localhost:8080';
export function mpa_route_plugin() {

  const htmlHandleApp = function (html, app) {
    html = html.replace('{{{global_config.INSTALLATION_NAME}}}', app.global_config.INSTALLATION_NAME)
    html = html.replace('{{app_config.HELP_CENTER_URL}}', app.app_config.HELP_CENTER_URL)
    html = html.replace('{{global_config.FB_APP_ID}}', app.global_config.FB_APP_ID)

    html = html.replace('{{app_config.GOOGLE_OAUTH_CLIENT_ID}}', app.app_config.GOOGLE_OAUTH_CLIENT_ID)
    html = html.replace('{{app_config.GOOGLE_OAUTH_CALLBACK_URL}}', app.app_config.GOOGLE_OAUTH_CALLBACK_URL)

    html = html.replace('{{global_config.FACEBOOK_API_VERSION}}', app.global_config.FACEBOOK_API_VERSION)
    html = html.replace('{{global_config.ENABLE_ACCOUNT_SIGNUP}}', app.global_config.ENABLE_ACCOUNT_SIGNUP)
    html = html.replace('{{global_config.IS_ENTERPRISE}}', app.global_config.IS_ENTERPRISE)
    html = html.replace('{{app_config.INSTALLATION_PRICING_PLAN}}', app.app_config.INSTALLATION_PRICING_PLAN)

    html = html.replace('{{{json app_config.AVAILABLE_LANGUAGES}}}', JSON.stringify(app.app_config.AVAILABLE_LANGUAGES))
    html = html.replace('{{{json app_config.FEATURE_HELP_URLS}}}', JSON.stringify(app.app_config.FEATURE_HELP_URLS))
    html = html.replace('{{app_config.LOCALE}}', app.app_config.LOCALE)


    html = html.replace('{{{json global_config}}}', JSON.stringify(app.global_config))
    html = html.replace('{{{json browser_config}}}', JSON.stringify(app.browser_config))
    return html;
  };
  return {
    name: 'route_plugin',
    apply: 'serve',
    configureServer: async (server: ViteDevServer) => {
      server.middlewares.use(async (req, res, next) => {
        // 自定义请求处理...
        // console.log('req.url', req.url);
        if (req.url === '/app/login' || req.url === '/auth') {
          const config = await fetch(backend + '/dashboard', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
          });
          const app = await config.json();
          let html = fs.readFileSync(path.resolve(__dirname, 'v3app.html'), {encoding: 'utf-8'})
          html = htmlHandleApp(html, app);
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' }).end(html);
        } else if (req.url?.startsWith('/app/accounts') || req.url === '/app/') {
          const config = await fetch(backend + '/dashboard', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
          });
          const app = await config.json();
          console.info('config', app);
          let html = fs.readFileSync(path.resolve(__dirname, 'dashboard.html'), {encoding: 'utf-8'})
          html = htmlHandleApp(html, app);
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' }).end(html);
        } else if (req.url?.startsWith('/widget?website_token=')) {
          const config = await fetch(backend + req.url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': req.headers['cookie'],
              'User-Agent': req.headers['user-agent'],
            },
          });
          console.info('config', config);
          const app = await config.json();
          let html = fs.readFileSync(path.resolve(__dirname, 'widget.html'), {encoding: 'utf-8'})
          html = html.replace('{{{global_config.INSTALLATION_NAME}}}', app.global_config.INSTALLATION_NAME)

          html = html.replace('{{inbox.avatar_url}}', app.inbox.avatar_url)
          html = html.replace('{{agent_bot.name}}', app.agent_bot.name)
          html = html.replace('{{account.locale}}', app.account.locale)

          html = html.replace('{{inbox.name}}', app.inbox.name)
          html = html.replace('{{inbox.working_hours_enabled}}', app.inbox.working_hours_enabled)
          html = html.replace('{{inbox.csat_survey_enabled}}', app.inbox.csat_survey_enabled)
          html = html.replace('{{inbox.out_of_office_message}}', app.inbox.out_of_office_message)
          html = html.replace('{{inbox.allow_messages_after_resolved}}', app.inbox.allow_messages_after_resolved)
          html = html.replace('{{{json inbox.portal}}}', JSON.stringify(app.inbox.portal))
          html = html.replace('{{{json inbox.feature_flags}}}', JSON.stringify(app.inbox.feature_flags))
          html = html.replace('{{{json inbox.working_hours}}}', JSON.stringify(app.inbox.working_hours))

          html = html.replace('{{web_widget.website_token}}', app.web_widget.website_token)
          html = html.replace('{{web_widget.welcome_tagline}}', app.web_widget.welcome_tagline)
          html = html.replace('{{web_widget.welcome_title}}', app.web_widget.welcome_title)
          html = html.replace('{{web_widget.widget_color}}', app.web_widget.widget_color)
          html = html.replace('{{web_widget.reply_time}}', app.web_widget.reply_time)
          html = html.replace('{{web_widget.pre_chat_form_enabled}}', app.web_widget.pre_chat_form_enabled)


          html = html.replace('{{{json languages}}}', JSON.stringify(app.languages))


          html = html.replace('{{account.features.disable_branding}}', app.features.disable_branding)
          html = html.replace('{{contact_inbox.pubsub_token}}', app.contact_inbox.pubsub_token)
          html = html.replace('{{auth_token}}', app.auth_token)

          html = html.replace('{{{json global_config}}}', JSON.stringify(app.global_config))
          html = html.replace('{{{json browser_config}}}', JSON.stringify(app.browser_config))
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' }).end(html);
        } else {
          next();
        }
      })
    },
  };
};


const isLibraryMode = process.env.BUILD_MODE === 'library';

const vueOptions = {
  template: {
    compilerOptions: {
      isCustomElement: tag => ['ninja-keys'].includes(tag),
    },
  },
};

export default defineConfig({
  plugins: [vue(vueOptions), mpa_route_plugin()],
  publicDir: 'public',
  server: {
    proxy: {
      // proxy requests to the backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: false,
      },
      '/cable': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: false,
      },
      '/file/attachments': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // [NOTE] when not in library mode, no new keys will be addedd or overwritten
        // setting dir: isLibraryMode ? 'public/packs' : undefined will not work
        ...(isLibraryMode
          ? {
              dir: 'public/packs',
              entryFileNames: chunkInfo => {
                if (chunkInfo.name === 'sdk') {
                  return 'js/sdk.js';
                }
                return '[name].js';
              },
            }
          : {}),
        inlineDynamicImports: isLibraryMode, // Disable code-splitting for SDK
      },
    },
    lib: isLibraryMode
      ? {
          entry: path.resolve(__dirname, './app/javascript/entrypoints/sdk.js'),
          formats: ['iife'], // IIFE format for single file
          name: 'sdk',
        }
      : undefined,
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
