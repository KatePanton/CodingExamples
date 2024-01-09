<template>
  <v-autocomplete
    :value="selectedTag"
    :items="tags"
    item-text="name"
    item-value="id"
    :label="$t('common.tag')"
    :placeholder="$t('common.tag')"
    :loading="loading"
    :disabled="loading || disabled"
    clearable dense filled rounded outlined
    class="mx-sm-4 explorer-toolbar-filter"
    data-cy="external-api-course-explorer-tag-filter"
    @change="setTag"
  />
</template>

<script>
import api from "@/library/api.lib";

export default {
  name: "ExternalApiExplorerTagSelectFilter",
  props: {
    selectedTag: {
      type: Number,
      default: null
    },
    section: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
    },
  },
  data: () => ({
    loading: false,
    tags: null
  }),
  mounted() {
    this.fetchTags();
  },
  methods: {
    async fetchTags() {
      this.loading = true;
      try {
        const response = await api().get(
          "/external-api-courses/tags"
        );
        this.tags = response.data;
        this.loading = false;
      } catch (e) {
        throw new Error(e);
      }
    },

    async setTag(tag) {
      this.$emit("change", tag);
    },
  }
};
</script>

<style scoped>  </style>
