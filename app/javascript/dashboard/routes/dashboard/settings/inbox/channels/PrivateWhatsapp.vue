<script>
import { mapGetters } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { useAlert } from 'dashboard/composables';
import { required } from '@vuelidate/validators';
import router from '../../../../index';
import { isPhoneE164OrEmpty, isNumber } from 'shared/helpers/Validators';
import ApiClient from 'dashboard/api/ApiClient';
import { ref, onMounted } from 'vue';
import QRCode from 'qrcode';

class WhatsAppPrivateApiClient extends ApiClient {
  constructor() {
    super('whatsapp_private_api', { accountScoped: true });
  }

  async fetchSessions() {
    return axios.get(`${this.url}/sessions`);
  }

  async fetchSessionDetail(session_id) {
    return axios.get(`${this.url}/sessions/` + session_id);
  }
}

const whatsAppPrivateApiClient = new WhatsAppPrivateApiClient();

export default {
  setup() {
    const options = ref([]);
    onMounted(async () => {
      const rsp = await whatsAppPrivateApiClient.fetchSessions();
      options.value = rsp.data;
    });
    return { v$: useVuelidate(), options: options };
  },
  data() {
    return {
      inboxName: '',
      phoneNumber: '',
      sessionId: '',
      intervalId: null,  // 用于存储定时器的ID
      session: {},
    };
  },
  mounted() {
    this.startUpdatingQrCode();
  },
  unmounted() {
    this.stopUpdatingQrCode();
  },

  computed: {
    ...mapGetters({ uiFlags: 'inboxes/getUIFlags' }),
  },
  validations: {
    inboxName: { required },
    phoneNumber: { required, isPhoneE164OrEmpty },
    sessionId: { required },
  },
  methods: {
    updateQrCode() {
      if (!this.sessionId) return;
      const canvas = document.getElementById('qrcode-canvas');
      // 这里可以按照你的需求动态改变二维码内容，比如每次添加时间戳等让其变化
      whatsAppPrivateApiClient.fetchSessionDetail(this.sessionId).then(resp => {
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
      const intervalTime = 5000;  // 每5秒更新一次，可根据需求调整
      this.intervalId = setInterval(() => {
        this.updateQrCode();
      }, intervalTime);
    },
    stopUpdatingQrCode() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    },

    handleSelectChange(event) {
      const selectedValue = event.target.value;
    },

    async createChannel() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }

      try {
        const whatsappChannel = await this.$store.dispatch(
          'inboxes/createChannel',
          {
            name: this.inboxName,
            channel: {
              type: 'whatsapp',
              phone_number: this.phoneNumber,
              provider: 'whatsapp_private',
              provider_config: {
                endpoint: this.endpoint,
                session_id: this.sessionId,
              },
            },
          }
        );

        router.replace({
          name: 'settings_inboxes_add_agents',
          params: {
            page: 'new',
            inbox_id: whatsappChannel.id,
          },
        });
      } catch (error) {
        useAlert(
          error.message || this.$t('INBOX_MGMT.ADD.WHATSAPP.API.ERROR_MESSAGE')
        );
      }
    },
  },
};
</script>

<template>
  <form class="flex flex-wrap mx-0" @submit.prevent="createChannel()">
    <div class="w-[65%] flex-shrink-0 flex-grow-0 max-w-[65%]">
      <label :class="{ error: v$.inboxName.$error }">
        {{ $t('INBOX_MGMT.ADD.WHATSAPP.INBOX_NAME.LABEL') }}
        <input
          v-model="inboxName"
          type="text"
          :placeholder="$t('INBOX_MGMT.ADD.WHATSAPP.INBOX_NAME.PLACEHOLDER')"
          @blur="v$.inboxName.$touch"
        />
        <span v-if="v$.inboxName.$error" class="message">
          {{ $t('INBOX_MGMT.ADD.WHATSAPP.INBOX_NAME.ERROR') }}
        </span>
      </label>
    </div>

    <div class="w-[65%] flex-shrink-0 flex-grow-0 max-w-[65%]">
      <label :class="{ error: v$.phoneNumber.$error }">
        {{ $t('INBOX_MGMT.ADD.WHATSAPP.PHONE_NUMBER.LABEL') }}
        <input
          v-model="phoneNumber"
          type="text"
          :placeholder="$t('INBOX_MGMT.ADD.WHATSAPP.PHONE_NUMBER.PLACEHOLDER')"
          @blur="v$.phoneNumber.$touch"
        />
        <span v-if="v$.phoneNumber.$error" class="message">
          {{ $t('INBOX_MGMT.ADD.WHATSAPP.PHONE_NUMBER.ERROR') }}
        </span>
      </label>
    </div>

    <div class="w-[65%] flex-shrink-0 flex-grow-0 max-w-[65%]">
      <label :class="{ error: v$.sessionId.$error }">
        <span>
          {{ $t('INBOX_MGMT.ADD.WHATSAPP.SESSION_ID.LABEL') }}
        </span>
        <select
          v-model="sessionId"
          @change="handleSelectChange"
          :placeholder="
            $t('INBOX_MGMT.ADD.WHATSAPP.SESSION_ID.PLACEHOLDER')
          "
          @blur="v$.sessionId.$touch"
        >
          <option
            v-for="option in options"
            :key="option.session_id"
            :value="option.session_id"
          >
            {{ option.session_id }} ({{ option.phone_number }})
          </option>
        </select>
        <span v-if="v$.sessionId.$error" class="message">
          {{ $t('INBOX_MGMT.ADD.WHATSAPP.SESSION_ID.ERROR') }}
        </span>
      </label>
    </div>
    <div class="w-full">
      <span>{{ session.state }} ({{ session.message }})</span>
      <canvas id="qrcode-canvas"></canvas>
    </div>

    <div class="w-full">
      <woot-submit-button
        :loading="uiFlags.isCreating"
        :button-text="$t('INBOX_MGMT.ADD.WHATSAPP.SUBMIT_BUTTON')"
      />
    </div>
  </form>
</template>
