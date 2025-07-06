<script>
import ReplyBox from './ReplyBox.vue';
import Modal from 'dashboard/components/Modal.vue';
import ResizableTextArea from 'shared/components/ResizableTextArea.vue';

export default {
  props: {
    message: {
      type: Object,
      default: () => ({}),
    },
    show: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    ReplyBox,
    Modal,
    ResizableTextArea,
  },
  emits: ['close', 'submit'],
  data() {
    return {
      editedContent: this.message.content || '',
    };
  },
  computed: {
    submitButtonLabel() {
      let sendMessageText = this.$t('CONVERSATION.REPLYBOX.SEND');
      const keyLabel = '(↵)';
      return `${sendMessageText} ${keyLabel}`;
    },
  },
  methods: {
    onClose() {
      this.$emit('close');
    },
    onSubmit() {
      this.$emit('submit', this.editedContent);
      this.onClose();
    },
  },
};
</script>

<template>
  <Modal 
    :show="show"
    :on-close="onClose"
    class="modal-big"
  >
  <div class="flex flex-col h-auto overflow-auto">
      <woot-modal-header
        :header-title="$t('CONVERSATION.CONTEXT_MENU.EDIT')"
      />
      <div class="flex flex-col modal-content w-full">
        <ResizableTextArea  class="input text-sm" :rows="4" v-model="editedContent" />
        <div class="flex flex-row justify-end mt-4">
            <woot-button size="small" @click="onSubmit">
                {{ submitButtonLabel }}
            </woot-button>
        </div>
      </div>
    </div>  
  </Modal>
</template>
