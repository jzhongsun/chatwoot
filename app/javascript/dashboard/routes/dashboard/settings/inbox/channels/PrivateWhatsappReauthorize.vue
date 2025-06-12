<script>
import { mapGetters } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import SettingsSection from '../../../../../components/SettingsSection.vue';
import ApiClient from 'dashboard/api/ApiClient';
import { ref, onMounted } from 'vue';
import QRCode from 'qrcode';

class WhatsAppPrivateApiClient extends ApiClient {
  constructor() {
    super('whatsapp_private_api', { accountScoped: true });
  }

  async fetchInboxSession(inbox_id) {
    return axios.get(`${this.url}/inboxes/` + inbox_id + '/session');
  }
}

const whatsAppPrivateApiClient = new WhatsAppPrivateApiClient();

export default {
  components: {
    SettingsSection,
  },
  props: {
    inbox: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const options = ref([]);
    onMounted(async () => {
      const rsp = await whatsAppPrivateApiClient.fetchInboxSession(this.inbox.id);
      options.value = rsp.data;
    });
    return { v$: useVuelidate(), options: options };
  },
  data() {
    return {
      phoneNumber: '',
      sessionId: '',
      intervalId: null,  // 用于存储定时器的ID
      session: {},
    };
  },
  mounted() {
    this.updateQrCode();
    this.startUpdatingQrCode();
  },
  unmounted() {
    this.stopUpdatingQrCode();
  },

  computed: {
    ...mapGetters({ uiFlags: 'inboxes/getUIFlags' }),
  },
  methods: {
    updateQrCode() {
      if (!this.inbox.id) return;
      const canvas = document.getElementById('qrcode-canvas');
      // 这里可以按照你的需求动态改变二维码内容，比如每次添加时间戳等让其变化
      whatsAppPrivateApiClient.fetchInboxSession(this.inbox.id).then(resp => {
        const sessionData = resp.data;
        this.session = sessionData;
        const qrCode = sessionData.qr;
        // 更新二维码内容
        QRCode.toCanvas(canvas, qrCode, function (error) {
          if (error) console.error('生成二维码出错：', error);
        });
      });
    },
    startUpdatingQrCode() {
      const intervalTime = 10_000;  // 每10秒更新一次，可根据需求调整
      this.intervalId = setInterval(() => {
        this.updateQrCode();
      }, intervalTime);
    },
    stopUpdatingQrCode() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    },
  },
};
</script>

<template>
  <SettingsSection
    :title="$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.TITLE')"
    :sub-title="$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SUBTITLE')"
  >
    <woot-code :script="session.session_id" />
    <span>{{ session.state }} {{ session.me?.pushName }}</span>
    <canvas id="qrcode-canvas"></canvas>
  </SettingsSection>
</template>
