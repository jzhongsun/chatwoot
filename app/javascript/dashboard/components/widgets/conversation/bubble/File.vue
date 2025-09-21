<script>
export default {
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  computed: {
    fileName() {
      if (this.url) {
        // Remove query parameters and hash from URL before extracting filename
        const urlWithoutParams = this.url.split('?')[0].split('#')[0];
        const filename = urlWithoutParams.substring(urlWithoutParams.lastIndexOf('/') + 1);
        return filename || this.$t('CONVERSATION.UNKNOWN_FILE_TYPE');
      }
      return this.$t('CONVERSATION.UNKNOWN_FILE_TYPE');
    },
    fileExtension() {
      if (this.fileName) {
        const lastDotIndex = this.fileName.lastIndexOf('.');
        if (lastDotIndex !== -1) {
          return this.fileName.substring(lastDotIndex + 1).toLowerCase();
        }
      }
      return '';
    },
    fileIcon() {
      const ext = this.fileExtension;
      
      // Document formats
      if (['pdf'].includes(ext)) return 'document-pdf-outline';
      if (['doc', 'docx'].includes(ext)) return 'document-word-outline';
      if (['xls', 'xlsx'].includes(ext)) return 'document-excel-outline';
      if (['ppt', 'pptx'].includes(ext)) return 'document-powerpoint-outline';
      if (['txt', 'rtf', 'md'].includes(ext)) return 'document-outline';
      
      // Image formats
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext)) return 'image-outline';
      
      // Video formats
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext)) return 'video-outline';
      
      // Audio formats
      if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(ext)) return 'music-outline';
      
      // Archive formats
      if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return 'archive-outline';
      
      // Code formats
      if (['js', 'ts', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(ext)) return 'code-outline';
      
      // Default document icon
      return 'document-outline';
    },
  },
  methods: {
    openLink() {
      const win = window.open(this.url, '_blank', 'noopener');
      if (win) win.focus();
    },
  },
};
</script>

<template>
  <div class="file message-text__wrap">
    <div class="icon-wrap">
      <fluent-icon :icon="fileIcon" class="file--icon" size="32" />
    </div>
    <div class="meta">
      <h5 class="attachment-name text-slate-700 dark:text-slate-400">
        {{ decodeURI(fileName) }}
      </h5>
      <a
        class="download clear link button small"
        rel="noreferrer noopener nofollow"
        target="_blank"
        :href="url"
      >
        {{ $t('CONVERSATION.DOWNLOAD') }}
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import 'dashboard/assets/scss/variables';

.file {
  display: flex;
  flex-direction: row;
  padding: $space-smaller 0;
  cursor: pointer;

  .icon-wrap {
    font-size: $font-size-giga;
    color: $color-white;
    line-height: 1;
    margin-left: $space-smaller;
    margin-right: $space-slab;
  }

  .attachment-name {
    margin: 0;
    color: $color-white;
    font-weight: $font-weight-bold;
    word-break: break-word;
  }

  .button {
    padding: 0;
    margin: 0;
    color: $color-primary-light;
  }

  .meta {
    padding-right: $space-two;
  }

  .time {
    min-width: $space-larger;
  }
}
</style>
