<script>
import { mapGetters } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { useAlert } from 'dashboard/composables';
import { required } from '@vuelidate/validators';
import router from '../../../../index';
import PageHeader from '../../SettingsSubPageHeader.vue';

export default {
  components: {
    PageHeader,
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      channelName: '',
      appId: '',
      appType: 'subscription',
      appSecret: '',
      token: '',
      aesKey: '',
    };
  },
  computed: {
    ...mapGetters({
      uiFlags: 'inboxes/getUIFlags',
    }),
  },
  validations: {
    channelName: { required },
    appId: { required },
    appType: { required },
    appSecret: { required },
    token: { required },
    aesKey: { required },
  },
  methods: {
    async createChannel() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }

      try {
        const wechat = await this.$store.dispatch(
          'inboxes/createChannel',
          {
            name: this.channelName,
            channel: {
              type: 'wechat',
              app_id: this.appId,
              app_type: this.appType,
              app_secret: this.appSecret,
              aes_secret: this.aesKey,
              token: this.token,
            },
          }
        );

        router.replace({
          name: 'settings_inboxes_add_agents',
          params: {
            page: 'new',
            inbox_id: weixin.id,
          },
        });
      } catch (error) {
        useAlert(this.$t('INBOX_MGMT.ADD.WECHAT_CHANNEL.API.ERROR_MESSAGE'));
      }
    },
  },
};
</script>

<template>
  <div
    class="border border-slate-25 dark:border-slate-800/60 bg-white dark:bg-slate-900 h-full p-6 w-full max-w-full md:w-3/4 md:max-w-[75%] flex-shrink-0 flex-grow-0"
  >
    <PageHeader
      :header-title="$t('INBOX_MGMT.ADD.WECHAT_CHANNEL.TITLE')"
      :header-content="$t('INBOX_MGMT.ADD.WECHAT_CHANNEL.DESC')"
    />
    <form class="flex flex-wrap mx-0" @submit.prevent="createChannel()">
      <div class="w-[65%] flex-shrink-0 flex-grow-0 max-w-[65%]">
        <label :class="{ error: v$.channelName.$error }">
          {{ $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.CHANNEL_NAME.LABEL') }}
          <input
            v-model="channelName"
            type="text"
            :placeholder="
              $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.CHANNEL_NAME.PLACEHOLDER')
            "
            @blur="v$.channelName.$touch"
          />
          <span v-if="v$.channelName.$error" class="message">{{
            $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.CHANNEL_NAME.ERROR')
          }}</span>
        </label>
      </div>
      <div class="w-[65%] flex-shrink-0 flex-grow-0 max-w-[65%]">
        <label>
          {{ $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.APP_TYPE.LABEL') }}
          <select v-model="appType">
            <option value="subscription">
              {{ $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.APP_TYPE.SUBSCRIPTION') }}
            </option>
            <option value="service">
              {{ $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.APP_TYPE.SERVICE') }}
            </option>
          </select>
        </label>
      </div>
      <div class="w-[65%] flex-shrink-0 flex-grow-0 max-w-[65%]">
        <label :class="{ error: v$.appId.$error }">
          {{ $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.APP_ID.LABEL') }}
          <input
            v-model="appId"
            type="text"
            :placeholder="
              $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.APP_ID.PLACEHOLDER')
            "
            @blur="v$.appId.$touch"
          />
        </label>
      </div>

      <div class="w-[65%] flex-shrink-0 flex-grow-0 max-w-[65%]">
        <label :class="{ error: v$.appSecret.$error }">
          {{ $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.APP_SECRET.LABEL') }}
          <input
            v-model="appSecret"
            type="text"
            :placeholder="
              $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.APP_SECRET.PLACEHOLDER')
            "
            @blur="v$.appSecret.$touch"
          />
        </label>
      </div>

      <div class="w-[65%] flex-shrink-0 flex-grow-0 max-w-[65%]">
        <label :class="{ error: v$.token.$error }">
          {{ $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.TOKEN.LABEL') }}
          <input
            v-model="token"
            type="text"
            :placeholder="
              $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.TOKEN.PLACEHOLDER')
            "
            @blur="v$.token.$touch"
          />
        </label>
      </div>

      <div class="w-[65%] flex-shrink-0 flex-grow-0 max-w-[65%]">
        <label :class="{ error: v$.aesKey.$error }">
          {{ $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.AES_KEY.LABEL') }}
          <input
            v-model="aesKey"
            type="text"
            :placeholder="
              $t('INBOX_MGMT.ADD.WECHAT_CHANNEL.AES_KEY.PLACEHOLDER')
            "
            @blur="v$.aesKey.$touch"
          />
        </label>
      </div>

      <div class="w-full">
        <woot-submit-button
          :loading="uiFlags.isCreating"
          :button-text="$t('INBOX_MGMT.ADD.WECHAT_CHANNEL.SUBMIT_BUTTON')"
        />
      </div>
    </form>
  </div>
</template>
