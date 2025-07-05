<script>
import { mapGetters } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import SettingsSection from '../../../../../components/SettingsSection.vue';
import ApiClient from 'dashboard/api/ApiClient';
import { ref, onMounted } from 'vue';
import QRCode from 'qrcode';
import PageHeader from '../../SettingsSubPageHeader.vue';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Auth from 'dashboard/api/auth';

/* global axios */

class WhatsAppPrivateApiClient extends ApiClient {
  constructor() {
    super('whatsapp_private_api', { accountScoped: true });
  }

  async fetchInboxSession(inbox_id) {
    return axios.get(`${this.url}/inboxes/` + inbox_id + '/session');
  }

  async syncContacts(inbox_id, onMessage, onError, onComplete) {
    let controller = new AbortController();

    try {
      const {
        'access-token': accessToken,
        'token-type': tokenType,
        client,
        expiry,
        uid,
      } = Auth.getAuthData();
      await fetchEventSource(`${this.url}/inboxes/${inbox_id}/contacts/sync`, {
        method: 'POST',
        headers: {
          'access-token': accessToken,
          'token-type': tokenType,
          client,
          expiry,
          uid,
        },
        signal: controller.signal,

        onopen(res) {
          if (res.ok) {
            console.log('Contacts sync connected');
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
        },

        onmessage(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'complete') {
              onComplete(data);
              controller.abort();
            } else if (data.type === 'error') {
              onError(data);
              controller.abort();
            } else {
              onMessage(data);
            }
          } catch (parseError) {
            console.error('Parse error:', parseError);
          }
        },
        onclose() {
          console.log('Contacts sync closed');
          onComplete({ type: 'complete', message: 'Contacts sync completed' });
        },

        onerror(err) {
          console.error('Contacts sync error:', err);
          onError(err);
          if (err.name === 'AbortError') return;
          throw err;
        },
      });
    } catch (error) {
      console.error('Contacts sync error:', error);
      onError(error);
    }

    return {
      close: () => controller.abort(),
      abort: () => controller.abort(),
    };
  }

  async syncGroups(inbox_id, onMessage, onError, onComplete) {
    let controller = new AbortController();

    try {
      const {
        'access-token': accessToken,
        'token-type': tokenType,
        client,
        expiry,
        uid,
      } = Auth.getAuthData();

      await fetchEventSource(`${this.url}/inboxes/${inbox_id}/groups/sync`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'access-token': accessToken,
          'token-type': tokenType,
          client,
          expiry,
          uid,
        },
        onopen(res) {
          if (res.ok) {
            console.log('Groups sync connected');
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
        },
        onmessage(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'complete') {
              onComplete(data);
              controller.abort();
            } else if (data.type === 'error') {
              onError(data);
              controller.abort();
            } else {
              onMessage(data);
            }
          } catch (parseError) {
            console.error('Parse error:', parseError);
          }
        },
        onclose() {
          console.log('Groups sync closed');
          onComplete({ type: 'complete', message: 'Groups sync completed' });
        },
        onerror(err) {
          onError(err);
          if (err.name === 'AbortError') return;
          throw err;
        },
      });
    } catch (error) {
      onError(error);
    }

    return {
      close: () => controller.abort(),
      abort: () => controller.abort(),
    };
  }

  async syncMessages(inbox_id, onMessage, onError, onComplete) {
    let controller = new AbortController();

    try {
      const {
        'access-token': accessToken,
        'token-type': tokenType,
        client,
        expiry,
        uid,
      } = Auth.getAuthData();

      await fetchEventSource(`${this.url}/inboxes/${inbox_id}/chats/sync`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'access-token': accessToken,
          'token-type': tokenType,
          client,
          expiry,
          uid,
        },
        onopen(res) {
          if (res.ok) {
            console.log('Messages sync connected');
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
        },
        onmessage(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'complete') {
              onComplete(data);
              controller.abort();
            } else if (data.type === 'error') {
              onError(data);
              controller.abort();
            } else {
              onMessage(data);
            }
          } catch (parseError) {
            console.error('Parse error:', parseError);
          }
        },
        onclose() {
          console.log('Messages sync closed');
          onComplete({ type: 'complete', message: 'Messages sync completed' });
        },
        onerror(err) {
          onError(err);
          if (err.name === 'AbortError') return;
          throw err;
        },
      });
    } catch (error) {
      onError(error);
    }

    return {
      close: () => controller.abort(),
      abort: () => controller.abort(),
    };
  }
}

const whatsAppPrivateApiClient = new WhatsAppPrivateApiClient();

export default {
  components: {
    SettingsSection,
    PageHeader,
  },
  props: {
    inbox: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const options = ref([]);
    onMounted(async () => {
      if (props.inbox?.id) {
        const rsp = await whatsAppPrivateApiClient.fetchInboxSession(props.inbox.id);
        options.value = rsp.data;
      }
    });
    return { v$: useVuelidate(), options: options };
  },
  data() {
    return {
      phoneNumber: '',
      sessionId: '',
      intervalId: null,  // 用于存储定时器的ID
      session: {},
      activeTab: 'contacts', // 当前激活的tab
      syncStates: {
        contacts: {
          loading: false,
          success: false,
          error: null,
          lastSyncTime: null,
          logs: [],
          eventSource: null,
        },
        groups: {
          loading: false,
          success: false,
          error: null,
          lastSyncTime: null,
          logs: [],
          eventSource: null,
        },
        messages: {
          loading: false,
          success: false,
          error: null,
          lastSyncTime: null,
          logs: [],
          eventSource: null,
        },
      },
    };
  },
  mounted() {
    this.updateQrCode();
    this.startUpdatingQrCode();
  },
  unmounted() {
    this.stopUpdatingQrCode();
    this.cleanupSSEConnections();
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
    async syncContacts() {
      if (!this.inbox.id) return;

      // 关闭之前的连接
      if (this.syncStates.contacts.eventSource) {
        this.syncStates.contacts.eventSource.close();
      }

      this.syncStates.contacts.loading = true;
      this.syncStates.contacts.error = null;
      this.syncStates.contacts.success = false;
      this.syncStates.contacts.logs = [];

      try {
        this.syncStates.contacts.eventSource = await whatsAppPrivateApiClient.syncContacts(
          this.inbox.id,
          // onMessage - 处理实时日志
          (data) => {
            this.syncStates.contacts.logs.push({
              timestamp: new Date(),
              type: data.type || 'info',
              message: data.message || JSON.stringify(data),
              data: data
            });

            // 自动滚动到最新日志
            this.$nextTick(() => {
              const logContainer = this.$refs.contactsLogContainer;
              if (logContainer) {
                logContainer.scrollTop = logContainer.scrollHeight;
              }
            });
          },
          // onError - 处理错误
          (error) => {
            this.syncStates.contacts.error = error.message || this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_CONTACTS_ERROR');
            this.syncStates.contacts.loading = false;

            // 添加错误日志
            this.syncStates.contacts.logs.push({
              timestamp: new Date(),
              type: 'error',
              message: this.syncStates.contacts.error,
              data: error
            });

            // 显示错误消息
            this.$store.dispatch('alerts/show', {
              message: this.syncStates.contacts.error,
              type: 'error',
            });
          },
          // onComplete - 处理完成
          (data) => {
            this.syncStates.contacts.success = true;
            this.syncStates.contacts.lastSyncTime = new Date();
            this.syncStates.contacts.loading = false;

            // 添加完成日志
            this.syncStates.contacts.logs.push({
              timestamp: new Date(),
              type: 'success',
              message: data.message || this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_CONTACTS_SUCCESS'),
              data: data
            });

            // 显示成功消息
            this.$store.dispatch('alerts/show', {
              message: this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_CONTACTS_SUCCESS'),
              type: 'success',
            });
          }
        );
      } catch (error) {
        this.syncStates.contacts.error = error.message || this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_CONTACTS_ERROR');
        this.syncStates.contacts.loading = false;

        // 显示错误消息
        this.$store.dispatch('alerts/show', {
          message: this.syncStates.contacts.error,
          type: 'error',
        });
      }
    },

    async syncGroups() {
      if (!this.inbox.id) return;

      this.syncStates.groups.loading = true;
      this.syncStates.groups.error = null;
      this.syncStates.groups.success = false;
      this.syncStates.groups.logs = [];

      try {
        this.syncStates.groups.eventSource = await whatsAppPrivateApiClient.syncGroups(
          this.inbox.id,
          (data) => {
            this.syncStates.groups.logs.push({
              timestamp: new Date(),
              type: data.type || 'info',
              message: data.message || JSON.stringify(data),
              data: data
            });
          },
          (error) => {
            this.syncStates.groups.error = error.message || this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_GROUPS_ERROR');
            this.syncStates.groups.loading = false;
          },
          (data) => {
            this.syncStates.groups.success = true;
            this.syncStates.groups.lastSyncTime = new Date();
            this.syncStates.groups.loading = false;
          }
        );
      } catch (error) {
        this.syncStates.groups.error = error.message || this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_GROUPS_ERROR');
        this.syncStates.groups.loading = false;

        // 显示错误消息
        this.$store.dispatch('alerts/show', {
          message: this.syncStates.groups.error,
          type: 'error',
        });
      }
    },
    async syncMessages() {
      if (!this.inbox.id) return;

      // 关闭之前的连接
      if (this.syncStates.messages.eventSource) {
        this.syncStates.messages.eventSource.close();
      }

      this.syncStates.messages.loading = true;
      this.syncStates.messages.error = null;
      this.syncStates.messages.success = false;
      this.syncStates.messages.logs = [];

      try {
        this.syncStates.messages.eventSource = await whatsAppPrivateApiClient.syncMessages(
          this.inbox.id,
          // onMessage - 处理实时日志
          (data) => {
            this.syncStates.messages.logs.push({
              timestamp: new Date(),
              type: data.type || 'info',
              message: data.message || JSON.stringify(data),
              data: data
            });

            // 自动滚动到最新日志
            this.$nextTick(() => {
              const logContainer = this.$refs.messagesLogContainer;
              if (logContainer) {
                logContainer.scrollTop = logContainer.scrollHeight;
              }
            });
          },
          // onError - 处理错误
          (error) => {
            this.syncStates.messages.error = error.message || this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_MESSAGES_ERROR');
            this.syncStates.messages.loading = false;

            // 添加错误日志
            this.syncStates.messages.logs.push({
              timestamp: new Date(),
              type: 'error',
              message: this.syncStates.messages.error,
              data: error
            });

            // 显示错误消息
            this.$store.dispatch('alerts/show', {
              message: this.syncStates.messages.error,
              type: 'error',
            });
          },
          // onComplete - 处理完成
          (data) => {
            this.syncStates.messages.success = true;
            this.syncStates.messages.lastSyncTime = new Date();
            this.syncStates.messages.loading = false;

            // 添加完成日志
            this.syncStates.messages.logs.push({
              timestamp: new Date(),
              type: 'success',
              message: data.message || this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_MESSAGES_SUCCESS'),
              data: data
            });

            // 显示成功消息
            this.$store.dispatch('alerts/show', {
              message: this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_MESSAGES_SUCCESS'),
              type: 'success',
            });
          }
        );
      } catch (error) {
        this.syncStates.messages.error = error.message || this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_MESSAGES_ERROR');
        this.syncStates.messages.loading = false;

        // 显示错误消息
        this.$store.dispatch('alerts/show', {
          message: this.syncStates.messages.error,
          type: 'error',
        });
      }
    },
    formatLastSyncTime(time) {
      if (!time) return '';
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(time);
    },
    cleanupSSEConnections() {
      if (this.syncStates.contacts.eventSource) {
        this.syncStates.contacts.eventSource.close();
        this.syncStates.contacts.eventSource = null;
      }
      if (this.syncStates.messages.eventSource) {
        this.syncStates.messages.eventSource.close();
        this.syncStates.messages.eventSource = null;
      }
    },
    stopSync(type) {
      if (this.syncStates[type].eventSource) {
        this.syncStates[type].eventSource.close();
        this.syncStates[type].eventSource = null;
        this.syncStates[type].loading = false;

        // 添加停止日志
        this.syncStates[type].logs.push({
          timestamp: new Date(),
          type: 'warning',
          message: this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_STOPPED'),
          data: { reason: 'user_cancelled' }
        });
      }
    },
    clearLogs(type) {
      this.syncStates[type].logs = [];
    },
    formatLogTime(timestamp) {
      return new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
      }).format(timestamp);
    },
    getStatusText(state) {
      const statusMap = {
        'WORKING': this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.STATUS_CONNECTED'),
        'DISCONNECTED': this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.STATUS_DISCONNECTED'),
        'CONNECTING': this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.STATUS_CONNECTING'),
        'SCAN_QR_CODE': this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.STATUS_SCAN_QR_CODE'),
      };
      return statusMap[state] || this.$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.STATUS_UNKNOWN');
    },
    setActiveTab(tab) {
      this.activeTab = tab;
    },
  },
};
</script>

<template>
  <div class="whatsapp-settings-container">
    <!-- <PageHeader
      :header-title="$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.TITLE')"
      :header-content="$t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SUBTITLE')"
    /> -->
    <!-- WhatsApp 连接状态区域 - 占整行 -->
    <div class="connection-status-section">
      <div class="session-info-card">
        <div class="session-header">
          <h4>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.CONNECTION_STATUS') }}</h4>
          <div class="connection-status" :class="`status-${session.state?.toLowerCase()}`">
            <div class="status-indicator"></div>
            <span class="status-text">{{ getStatusText(session.state) }}</span>
          </div>
        </div>

        <div class="session-content">
          <!-- 会话详情 -->
          <div v-if="session.session_id" class="session-details">
            <div class="detail-item">
              <label>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SESSION_ID.TITLE') }}:</label>
              <woot-code class="w-1/4" :script="session.session_id" />
            </div>

            <div v-if="session.me?.pushName" class="detail-item">
              <label>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.CONNECTED_USER') }}:</label>
              <span class="user-info">
                <i class="ion-person"></i>
                {{ session.me.pushName }}
              </span>
            </div>
          </div>

          <!-- 二维码区域 -->
          <div v-if="session.state === 'SCAN_QR_CODE'" class="qrcode-section">
            <div class="qrcode-container">
              <div class="qrcode-header">
                <h5>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SCAN_QR_CODE') }}</h5>
                <p class="qrcode-instruction">
                  {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.QR_CODE_INSTRUCTION') }}
                </p>
              </div>
              <div class="qrcode-wrapper">
                <canvas id="qrcode-canvas"></canvas>
                <div class="qrcode-refresh-indicator">
                  <i class="ion-refresh"></i>
                  <span>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.AUTO_REFRESH') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 已连接状态显示 -->
          <div v-else-if="session.state === 'WORKING'" class="connected-status">
            <div class="connected-info">
              <div class="connected-icon">
                <i class="ion-checkmark-circled"></i>
              </div>
              <div class="connected-text">
                <h5>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.CONNECTED_SUCCESSFULLY') }}</h5>
                <p>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.READY_TO_SYNC') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 同步区域 - Tab形式 -->
    <div class="sync-section" v-if="session.state === 'WORKING'">
      <div class="sync-tabs">
        <div class="tab-headers">
          <button class="tab-header" :class="{ active: activeTab === 'contacts' }" @click="setActiveTab('contacts')">
            <i class="ion-person-stalker"></i>
            {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_CONTACTS_TITLE') }}
            <span v-if="syncStates.contacts.loading" class="tab-loading">
              <woot-spinner size="small" />
            </span>
            <span v-else-if="syncStates.contacts.success" class="tab-success">
              <i class="ion-checkmark-round"></i>
            </span>
            <span v-else-if="syncStates.contacts.error" class="tab-error">
              <i class="ion-alert-circled"></i>
            </span>
          </button>

          <button class="tab-header" :class="{ active: activeTab === 'groups' }" @click="setActiveTab('groups')">
            <i class="ion-people"></i>
            {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_GROUPS_TITLE') }}
            <span v-if="syncStates.groups.loading" class="tab-loading">
              <woot-spinner size="small" />
            </span>
            <span v-else-if="syncStates.groups.success" class="tab-success">
              <i class="ion-checkmark-round"></i>
            </span>
            <span v-else-if="syncStates.groups.error" class="tab-error">
              <i class="ion-alert-circled"></i>
            </span>
          </button>

          <button class="tab-header" :class="{ active: activeTab === 'messages' }" @click="setActiveTab('messages')">
            <i class="ion-chatbox-working"></i>
            {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_MESSAGES_TITLE') }}
            <span v-if="syncStates.messages.loading" class="tab-loading">
              <woot-spinner size="small" />
            </span>
            <span v-else-if="syncStates.messages.success" class="tab-success">
              <i class="ion-checkmark-round"></i>
            </span>
            <span v-else-if="syncStates.messages.error" class="tab-error">
              <i class="ion-alert-circled"></i>
            </span>
          </button>
        </div>

        <div>
          <!-- 同步联系人 Tab -->
          <div v-show="activeTab === 'contacts'" class="tab-panel">
            <div class="sync-panel">
              <div class="sync-header">
                <div class="sync-info">
                  <h4>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_CONTACTS_TITLE') }}</h4>
                  <p class="sync-description">
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_CONTACTS_DESCRIPTION') }}
                  </p>
                </div>
                <div class="sync-status">
                  <woot-spinner v-if="syncStates.contacts.loading" size="small" />
                  <span v-else-if="syncStates.contacts.success" class="success-indicator">
                    <i class="ion-checkmark-round"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_SUCCESS') }}
                  </span>
                  <span v-else-if="syncStates.contacts.error" class="error-indicator">
                    <i class="ion-alert-circled"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_FAILED') }}
                  </span>
                </div>
              </div>

              <div class="sync-actions">
                <div class="sync-buttons">
                  <woot-button :loading="syncStates.contacts.loading"
                    :disabled="syncStates.contacts.loading || syncStates.messages.loading" @click="syncContacts"
                    size="medium" variant="smooth">
                    <i class="ion-person-stalker"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_CONTACTS_BUTTON') }}
                  </woot-button>

                  <woot-button v-if="syncStates.contacts.loading" @click="stopSync('contacts')" size="medium"
                    variant="hollow" color-scheme="secondary">
                    <i class="ion-stop"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.STOP_SYNC') }}
                  </woot-button>

                  <woot-button v-if="syncStates.contacts.logs.length > 0" @click="clearLogs('contacts')" size="medium"
                    variant="clear" color-scheme="secondary">
                    <i class="ion-trash-a"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.CLEAR_LOGS') }}
                  </woot-button>
                </div>

                <div v-if="syncStates.contacts.lastSyncTime" class="last-sync-time">
                  {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.LAST_SYNC') }}:
                  {{ formatLastSyncTime(syncStates.contacts.lastSyncTime) }}
                </div>
              </div>

              <!-- 实时日志显示 -->
              <div v-if="syncStates.contacts.logs.length > 0" class="sync-logs">
                <div class="logs-header">
                  <h5>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_LOGS') }}</h5>
                  <span class="logs-count">{{ syncStates.contacts.logs.length }} {{
                    $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.LOGS_COUNT') }}</span>
                </div>
                <div ref="contactsLogContainer" class="logs-container">
                  <div v-for="(log, index) in syncStates.contacts.logs" :key="index" class="log-entry"
                    :class="`log-${log.type}`">
                    <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
                    <span class="log-type">{{ log.type.toUpperCase() }}</span>
                    <span class="log-message">{{ log.message }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 同步群组 Tab -->
          <div v-show="activeTab === 'groups'" class="tab-panel">
            <div class="sync-panel">
              <div class="sync-header">
                <div class="sync-info">
                  <h4>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_GROUPS_TITLE') }}</h4>
                  <p class="sync-description">
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_GROUPS_DESCRIPTION') }}
                  </p>
                </div>
                <div class="sync-status">
                  <woot-spinner v-if="syncStates.groups.loading" size="small" />
                  <span v-else-if="syncStates.groups.success" class="success-indicator">
                    <i class="ion-checkmark-round"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_SUCCESS') }}
                  </span>
                  <span v-else-if="syncStates.groups.error" class="error-indicator">
                    <i class="ion-alert-circled"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_FAILED') }}
                  </span>
                </div>
              </div>

              <div class="sync-actions">
                <div class="sync-buttons">
                  <woot-button :loading="syncStates.contacts.loading"
                    :disabled="syncStates.groups.loading || syncStates.messages.loading" @click="syncGroups"
                    size="medium" variant="smooth">
                    <i class="ion-person-stalker"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_GROUPS_BUTTON') }}
                  </woot-button>

                  <woot-button v-if="syncStates.groups.loading" @click="stopSync('groups')" size="medium"
                    variant="hollow" color-scheme="secondary">
                    <i class="ion-stop"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.STOP_SYNC') }}
                  </woot-button>

                  <woot-button v-if="syncStates.groups.logs.length > 0" @click="clearLogs('groups')" size="medium"
                    variant="clear" color-scheme="secondary">
                    <i class="ion-trash-a"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.CLEAR_LOGS') }}
                  </woot-button>
                </div>

                <div v-if="syncStates.groups.lastSyncTime" class="last-sync-time">
                  {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.LAST_SYNC') }}:
                  {{ formatLastSyncTime(syncStates.groups.lastSyncTime) }}
                </div>
              </div>

              <!-- 实时日志显示 -->
              <div v-if="syncStates.groups.logs.length > 0" class="sync-logs">
                <div class="logs-header">
                  <h5>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_LOGS') }}</h5>
                  <span class="logs-count">{{ syncStates.groups.logs.length }} {{
                    $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.LOGS_COUNT') }}</span>
                </div>
                <div ref="contactsLogContainer" class="logs-container">
                  <div v-for="(log, index) in syncStates.groups.logs" :key="index" class="log-entry"
                    :class="`log-${log.type}`">
                    <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
                    <span class="log-type">{{ log.type.toUpperCase() }}</span>
                    <span class="log-message">{{ log.message }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 同步消息 Tab -->
          <div v-show="activeTab === 'messages'" class="tab-panel">
            <div class="sync-panel">
              <div class="sync-header">
                <div class="sync-info">
                  <h4>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_MESSAGES_TITLE') }}</h4>
                  <p class="sync-description">
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_MESSAGES_DESCRIPTION') }}
                  </p>
                </div>
                <div class="sync-status">
                  <woot-spinner v-if="syncStates.messages.loading" size="small" />
                  <span v-else-if="syncStates.messages.success" class="success-indicator">
                    <i class="ion-checkmark-round"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_SUCCESS') }}
                  </span>
                  <span v-else-if="syncStates.messages.error" class="error-indicator">
                    <i class="ion-alert-circled"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_FAILED') }}
                  </span>
                </div>
              </div>

              <div class="sync-actions">
                <div class="sync-buttons">
                  <woot-button :loading="syncStates.messages.loading"
                    :disabled="syncStates.messages.loading || syncStates.contacts.loading" @click="syncMessages"
                    size="medium" variant="smooth">
                    <i class="ion-chatbox-working"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_MESSAGES_BUTTON') }}
                  </woot-button>

                  <woot-button v-if="syncStates.messages.loading" @click="stopSync('messages')" size="medium"
                    variant="hollow" color-scheme="secondary">
                    <i class="ion-stop"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.STOP_SYNC') }}
                  </woot-button>

                  <woot-button v-if="syncStates.messages.logs.length > 0" @click="clearLogs('messages')" size="medium"
                    variant="clear" color-scheme="secondary">
                    <i class="ion-trash-a"></i>
                    {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.CLEAR_LOGS') }}
                  </woot-button>
                </div>

                <div v-if="syncStates.messages.lastSyncTime" class="last-sync-time">
                  {{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.LAST_SYNC') }}:
                  {{ formatLastSyncTime(syncStates.messages.lastSyncTime) }}
                </div>
              </div>

              <!-- 实时日志显示 -->
              <div v-if="syncStates.messages.logs.length > 0" class="sync-logs">
                <div class="logs-header">
                  <h5>{{ $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.SYNC_LOGS') }}</h5>
                  <span class="logs-count">{{ syncStates.messages.logs.length }} {{
                    $t('INBOX_MGMT.SETTINGS_WHATSAPP_PRIVATE.LOGS_COUNT') }}</span>
                </div>
                <div ref="messagesLogContainer" class="logs-container">
                  <div v-for="(log, index) in syncStates.messages.logs" :key="index" class="log-entry"
                    :class="`log-${log.type}`">
                    <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
                    <span class="log-type">{{ log.type.toUpperCase() }}</span>
                    <span class="log-message">{{ log.message }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.whatsapp-settings-container {
  padding: 16px;
  background: white;
}

/* 连接状态区域 */
.connection-status-section {
  margin-top: 24px;
  margin-bottom: 24px;
}

.session-info-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.session-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.connection-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* 状态颜色 */
.status-working {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-working .status-indicator {
  background-color: #22c55e;
}

.status-disconnected {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.status-disconnected .status-indicator {
  background-color: #ef4444;
}

.status-connecting,
.status-scan_qr_code {
  background-color: #fefce8;
  color: #a16207;
  border: 1px solid #fef3c7;
}

.status-connecting .status-indicator,
.status-scan_qr_code .status-indicator {
  background-color: #eab308;
}

.session-content {
  margin-top: 16px;
}

.session-details {
  margin-bottom: 16px;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #111827;
}

/* 二维码区域 */
.qrcode-section {
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
}

.qrcode-header h5 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.qrcode-instruction {
  margin: 0 0 16px 0;
  color: #6b7280;
  font-size: 14px;
}

.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

#qrcode-canvas {
  border: 4px solid #f3f4f6;
  border-radius: 8px;
}

.qrcode-refresh-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  font-size: 12px;
}

/* 已连接状态 */
.connected-status {
  padding: 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.connected-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connected-icon i {
  font-size: 24px;
  color: #22c55e;
}

.connected-text h5 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #166534;
}

.connected-text p {
  margin: 0;
  color: #15803d;
  font-size: 14px;
}

/* 同步区域 */
.sync-section {
  margin-top: 24px;
}

.sync-tabs {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.tab-headers {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
}

.tab-header {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-right: 1px solid #e5e7eb;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.tab-header:last-child {
  border-right: none;
}

.tab-header:hover {
  background: #f3f4f6;
  color: #374151;
}

.tab-header.active {
  background: white;
  color: #2563eb;
  font-weight: 600;
  border-bottom: 2px solid #2563eb;
  margin-bottom: -1px;
}

.tab-success {
  color: #22c55e;
}

.tab-error {
  color: #ef4444;
}

.tab-panel {
  padding: 20px;
}

.sync-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sync-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.sync-info h4 {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.sync-description {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.sync-status {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
}

.success-indicator {
  color: #22c55e;
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-indicator {
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sync-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sync-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.last-sync-time {
  font-size: 12px;
  color: #6b7280;
}

.sync-logs {
  margin-top: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.logs-header h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.logs-count {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 8px;
}

.logs-container {
  max-height: 250px;
  overflow-y: auto;
  padding: 8px;
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 4px 6px;
  margin-bottom: 2px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 11px;
  line-height: 1.3;
}

.log-time {
  color: #6b7280;
  min-width: 60px;
  font-weight: 500;
}

.log-type {
  min-width: 50px;
  font-weight: 600;
  font-size: 10px;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

/* 日志类型样式 */
.log-info {
  background: #eff6ff;
}

.log-info .log-type {
  color: #2563eb;
}

.log-success {
  background: #f0fdf4;
}

.log-success .log-type {
  color: #16a34a;
}

.log-error {
  background: #fef2f2;
}

.log-error .log-type {
  color: #dc2626;
}

.log-warning {
  background: #fefce8;
}

.log-warning .log-type {
  color: #ca8a04;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .session-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
  }

  .session-details {
    flex: 1;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .detail-item label {
    min-width: 100px;
  }

  .sync-header {
    align-items: center;
  }

  .sync-actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

@media (max-width: 767px) {
  .whatsapp-settings-container {
    padding: 16px;
  }

  .session-header {
    flex-direction: column;
    gap: 8px;
  }

  .connected-info {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .tab-header {
    padding: 10px 12px;
    font-size: 13px;
  }

  .tab-panel {
    padding: 16px;
  }

  .sync-header {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
