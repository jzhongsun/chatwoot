
import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import { ViteDevServer } from 'vite';
import fs from 'fs';

const web_channel = {
  avatarUrl: '',
  hasAConnectedAgentBot: '',
  locale: 'zh_CN',
  websiteName: 'Acme Support',
  websiteToken: 'CrP8MScC1xN497ogP22rYG8G',
  welcomeTagline: '标签',
  welcomeTitle: '标题',
  widgetColor: '#901E31',
  portal: null,
  enabledFeatures: ["attachments", "emoji_picker", "end_conversation"],
  enabledLanguages: [{ "name": "English (en)", "iso_639_1_code": "en" }, { "name": "العربية (ar)", "iso_639_1_code": "ar" }, { "name": "Nederlands (nl) ", "iso_639_1_code": "nl" }, { "name": "Français (fr)", "iso_639_1_code": "fr" }, { "name": "Deutsch (de)", "iso_639_1_code": "de" }, { "name": "Italiano (it)", "iso_639_1_code": "it" }, { "name": "日本語 (ja)", "iso_639_1_code": "ja" }, { "name": "한국어 (ko)", "iso_639_1_code": "ko" }, { "name": "Português (pt)", "iso_639_1_code": "pt" }, { "name": "русский (ru)", "iso_639_1_code": "ru" }, { "name": "Español (es)", "iso_639_1_code": "es" }, { "name": "മലയാളം (ml)", "iso_639_1_code": "ml" }, { "name": "Català (ca)", "iso_639_1_code": "ca" }, { "name": "ελληνικά (el)", "iso_639_1_code": "el" }, { "name": "Português Brasileiro (pt-BR)", "iso_639_1_code": "pt_BR" }, { "name": "Română (ro)", "iso_639_1_code": "ro" }, { "name": "தமிழ் (ta)", "iso_639_1_code": "ta" }, { "name": "فارسی (fa)", "iso_639_1_code": "fa" }, { "name": "中文 (台湾) (zh-TW)", "iso_639_1_code": "zh_TW" }, { "name": "Tiếng Việt (vi)", "iso_639_1_code": "vi" }, { "name": "dansk (da)", "iso_639_1_code": "da" }, { "name": "Türkçe (tr)", "iso_639_1_code": "tr" }, { "name": "čeština (cs)", "iso_639_1_code": "cs" }, { "name": "suomi, suomen kieli (fi)", "iso_639_1_code": "fi" }, { "name": "Bahasa Indonesia (id)", "iso_639_1_code": "id" }, { "name": "Svenska (sv)", "iso_639_1_code": "sv" }, { "name": "magyar nyelv (hu)", "iso_639_1_code": "hu" }, { "name": "norsk (no)", "iso_639_1_code": "no" }, { "name": "中文 (zh-CN)", "iso_639_1_code": "zh_CN" }, { "name": "język polski (pl)", "iso_639_1_code": "pl" }, { "name": "slovenčina (sk)", "iso_639_1_code": "sk" }, { "name": "украї́нська мо́ва (uk)", "iso_639_1_code": "uk" }, { "name": "ภาษาไทย (th)", "iso_639_1_code": "th" }, { "name": "latviešu valoda (lv)", "iso_639_1_code": "lv" }, { "name": "íslenska (is)", "iso_639_1_code": "is" }, { "name": "עִברִית (he)", "iso_639_1_code": "he" }, { "name": "lietuvių (lt)", "iso_639_1_code": "lt" }, { "name": "Српски (sr)", "iso_639_1_code": "sr" }],
  replyTime: 'in_a_few_minutes',
  preChatFormEnabled: false,
  preChatFormOptions: { "pre_chat_fields": [{ "name": "emailAddress", "type": "email", "label": "Email Id", "enabled": false, "required": true, "field_type": "standard" }, { "name": "fullName", "type": "text", "label": "Full name", "enabled": false, "required": false, "field_type": "standard" }, { "name": "phoneNumber", "type": "text", "label": "Phone number", "enabled": false, "required": false, "field_type": "standard" }], "pre_chat_message": "Share your queries or comments here." },
  workingHoursEnabled: false,
  csatSurveyEnabled: false,
  workingHours: [{ "id": 1, "inbox_id": 1, "account_id": 1, "day_of_week": 0, "closed_all_day": true, "open_hour": null, "open_minutes": null, "close_hour": null, "close_minutes": null, "created_at": "2024-10-07T15:02:49.662Z", "updated_at": "2024-10-07T15:02:49.662Z", "open_all_day": false }, { "id": 2, "inbox_id": 1, "account_id": 1, "day_of_week": 1, "closed_all_day": false, "open_hour": 9, "open_minutes": 0, "close_hour": 17, "close_minutes": 0, "created_at": "2024-10-07T15:02:49.668Z", "updated_at": "2024-10-07T15:02:49.668Z", "open_all_day": false }, { "id": 3, "inbox_id": 1, "account_id": 1, "day_of_week": 2, "closed_all_day": false, "open_hour": 9, "open_minutes": 0, "close_hour": 17, "close_minutes": 0, "created_at": "2024-10-07T15:02:49.670Z", "updated_at": "2024-10-07T15:02:49.670Z", "open_all_day": false }, { "id": 4, "inbox_id": 1, "account_id": 1, "day_of_week": 3, "closed_all_day": false, "open_hour": 9, "open_minutes": 0, "close_hour": 17, "close_minutes": 0, "created_at": "2024-10-07T15:02:49.672Z", "updated_at": "2024-10-07T15:02:49.672Z", "open_all_day": false }, { "id": 5, "inbox_id": 1, "account_id": 1, "day_of_week": 4, "closed_all_day": false, "open_hour": 9, "open_minutes": 0, "close_hour": 17, "close_minutes": 0, "created_at": "2024-10-07T15:02:49.675Z", "updated_at": "2024-10-07T15:02:49.675Z", "open_all_day": false }, { "id": 6, "inbox_id": 1, "account_id": 1, "day_of_week": 5, "closed_all_day": false, "open_hour": 9, "open_minutes": 0, "close_hour": 17, "close_minutes": 0, "created_at": "2024-10-07T15:02:49.677Z", "updated_at": "2024-10-07T15:02:49.677Z", "open_all_day": false }, { "id": 7, "inbox_id": 1, "account_id": 1, "day_of_week": 6, "closed_all_day": true, "open_hour": null, "open_minutes": null, "close_hour": null, "close_minutes": null, "created_at": "2024-10-07T15:02:49.679Z", "updated_at": "2024-10-07T15:02:49.679Z", "open_all_day": false }],
  outOfOfficeMessage: null,
  utcOffset: '+00:00',
  timezone: 'UTC',
  allowMessagesAfterResolved: true,
  disableBranding: true,
};
const csrf_token = 'NKgyM8tY6awKD9iZyQZewynrZmGBpfyLHISbr_FevuQa7dkRyZ38l2vpp8dg6T8FISaki9vDTZZH571PyXwReA';

const backend = 'http://localhost:8080';
export function mpa_route_plugin() {
  return {
    name: 'route_plugin',
    apply: 'serve',
    configureServer: async (server: ViteDevServer) => {
      server.middlewares.use(async (req, res, next) => {
        // 自定义请求处理...
        console.log('req.url', req.url);
        if (req.url === '/app/' || req.url === '/') {
          let html = fs.readFileSync(path.resolve(__dirname, 'dashboard.html'), {encoding: 'utf-8'})
          res.end(html);
        } else if (req.url === '/app/login') {
          let html = fs.readFileSync(path.resolve(__dirname, 'v3app.html'), {encoding: 'utf-8'})
          res.end(html);
        } else if (req.url?.startsWith('/widget?website_token=')) {
          const config = await fetch(backend + req.url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
          });
          console.info('config', config);
          const widget = await config.json();
          let html = fs.readFileSync(path.resolve(__dirname, 'widget.html'), {encoding: 'utf-8'})
          html = html.replace('{{installation_name}}', widget.global_config.installation_name)
          html = html.replace('{{csrf_token}}', csrf_token)
          html = html.replace('{{pubsub_token}}', widget.contact_inbox.pubsub_token)
          html = html.replace('{{auth_token}}', widget.conversation_token)
          html = html.replace('{{global_config}}', JSON.stringify(widget.global_config))
          html = html.replace('{{web_channel}}', JSON.stringify(web_channel))
          res.end(html);
        } else if (req.url?.startsWith('/app/accounts')) {
          let html = fs.readFileSync(path.resolve(__dirname, 'dashboard.html'), {encoding: 'utf-8'})
          res.end(html);
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
