<script>
export default {
  props: {
    icon: {
      type: String,
      required: true,
    },
    icons: {
      type: Object,
      required: true,
    },
    size: {
      type: [String, Number],
      default: '20',
    },
    type: {
      type: String,
      default: 'outline',
    },
    viewBox: {
      type: String,
      default: '0 0 24 24',
    },
    iconLib: {
      type: String,
      default: 'fluent',
    },
  },

  computed: {
    pathSource() {
      // To support icons with multiple paths
      const iconKey = `${this.icon}-${this.type}`;
      const path = this.icons[iconKey];
      
      // Debug logging
      console.log('Icon lookup:', {
        icon: this.icon,
        type: this.type,
        iconKey: iconKey,
        found: !!path,
        iconsKeys: Object.keys(this.icons).slice(0, 5) // Show first 5 keys for debugging
      });
      
      if (!path) {
        // Return default document icon if icon not found
        const defaultPath = this.icons['document-outline'];
        if (defaultPath) {
          console.log('Using default document icon');
          return [defaultPath];
        }
        // Fallback to empty array if even default icon is not found
        console.log('No default icon found, returning empty array');
        return [];
      }
      if (path.constructor === Array) {
        return path;
      }
      return [path];
    },
  },
};
</script>

<template>
  <svg
    v-if="iconLib === 'fluent'"
    :width="size"
    :height="size"
    fill="none"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      v-for="source in pathSource"
      :key="source"
      :d="source"
      fill="currentColor"
    />
  </svg>
  <svg
    v-else
    :width="size"
    :height="size"
    fill="none"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g v-for="(pathData, index) in pathSource" :key="index">
      <path
        :key="pathData"
        :d="pathData"
        stroke="currentColor"
        stroke-width="1.66667"
      />
    </g>
  </svg>
</template>
