<script>
import { Letter } from 'vue-letter';
import GalleryView from '../components/GalleryView.vue';

export default {
  components: { Letter, GalleryView },
  props: {
    message: {
      type: String,
      default: '',
    },
    isEmail: {
      type: Boolean,
      default: true,
    },
    displayQuotedButton: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showQuotedContent: false,
      showGalleryViewer: false,
      attachment: {},
      availableAttachments: [],
    };
  },
  computed: {
    isQuotedContentPresent() {
      if (!this.isEmail) {
        return this.message.includes('<blockquote');
      }
      return this.showQuotedContent;
    },
    showQuoteToggle() {
      if (!this.isEmail) {
        return false;
      }
      return this.displayQuotedButton;
    },
    isBase64Image() {
      return this.isBase64ImageContent(this.message);
    },
  },
  methods: {
    isBase64ImageContent(content) {
      if (!content || typeof content !== 'string') {
        return false;
      }
      
      const trimmedContent = content.trim();
      
      // Check if content is a pure base64 JPEG string (starts with /9j/)
      if (trimmedContent.startsWith('/9j/')) {
        return true;
      }
      
      // Check if content contains base64 string wrapped in HTML tags (like <p>/9j/...</p>)
      if (trimmedContent.includes('/9j/')) {
        // Extract the base64 string from HTML content
        const base64Match = trimmedContent.match(/\/9j\/[A-Za-z0-9+/=]+/);
        if (base64Match) {
          return true;
        }
      }
      
      return false;
    },
    getImageSrc(content) {
      const trimmedContent = content.trim();
      
      // If content starts with /9j/, use it directly
      if (trimmedContent.startsWith('/9j/')) {
        return `data:image/jpeg;base64,${trimmedContent}`;
      }
      
      // If content contains /9j/ wrapped in HTML, extract it
      if (trimmedContent.includes('/9j/')) {
        const base64Match = trimmedContent.match(/\/9j\/[A-Za-z0-9+/=]+/);
        if (base64Match) {
          return `data:image/jpeg;base64,${base64Match[0]}`;
        }
      }
      
      // Fallback: use the entire content
      return `data:image/jpeg;base64,${trimmedContent}`;
    },
    toggleQuotedContent() {
      this.showQuotedContent = !this.showQuotedContent;
    },
    handleClickOnContent(event) {
      // if event target is IMG and not close in A tag
      // then open image preview
      const isImageElement = event.target.tagName === 'IMG';
      const isWrappedInLink = event.target.closest('A');

      if (isImageElement && !isWrappedInLink) {
        this.openImagePreview(event.target.src);
      }
    },
    openImagePreview(src) {
      this.showGalleryViewer = true;
      this.attachment = {
        file_type: 'image',
        data_url: src,
        message_id: Math.floor(Math.random() * 100),
      };
      this.availableAttachments = [{ ...this.attachment }];
    },
    onClose() {
      this.showGalleryViewer = false;
      this.resetAttachmentData();
    },
    resetAttachmentData() {
      this.attachment = {};
      this.availableAttachments = [];
    },
  },
};
</script>

<template>
  <div
    class="message-text__wrap"
    :class="{
      'show--quoted': isQuotedContentPresent,
      'hide--quoted': !isQuotedContentPresent,
    }"
  >
    <div v-if="isBase64Image" class="base64-image-container">
      <img
        :src="getImageSrc(message)"
        alt="Base64 Image"
        class="base64-image"
        @click="openImagePreview(getImageSrc(message))"
      />
    </div>
    <div v-else-if="!isEmail" v-dompurify-html="message" class="text-content" />
    <div v-else @click="handleClickOnContent">
      <Letter
        class="text-content bg-white dark:bg-white text-slate-900 dark:text-slate-900 p-2 rounded-[4px]"
        :html="message"
      />
    </div>
    <button
      v-if="showQuoteToggle"
      class="py-1 text-xs cursor-pointer text-slate-300 dark:text-slate-300"
      @click="toggleQuotedContent"
    >
      <span v-if="showQuotedContent" class="flex items-center gap-0.5">
        <fluent-icon icon="chevron-up" size="16" />
        {{ $t('CHAT_LIST.HIDE_QUOTED_TEXT') }}
      </span>
      <span v-else class="flex items-center gap-0.5">
        <fluent-icon icon="chevron-down" size="16" />
        {{ $t('CHAT_LIST.SHOW_QUOTED_TEXT') }}
      </span>
    </button>
    <GalleryView
      v-if="showGalleryViewer"
      v-model:show="showGalleryViewer"
      :attachment="attachment"
      :all-attachments="availableAttachments"
      @error="onClose"
      @close="onClose"
    />
  </div>
</template>

<style lang="scss">
.text-content {
  overflow: auto;

  ul,
  ol {
    padding-left: var(--space-two);
  }

  table {
    margin: 0;
    border: 0;

    td {
      margin: 0;
      border: 0;
    }

    tr {
      border-bottom: 0 !important;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: var(--font-size-normal);
  }
}

.show--quoted {
  blockquote {
    @apply block;
  }
}

.hide--quoted {
  blockquote {
    @apply hidden;
  }
}

.base64-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  margin: 0 auto;
}

.base64-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
}
</style>
