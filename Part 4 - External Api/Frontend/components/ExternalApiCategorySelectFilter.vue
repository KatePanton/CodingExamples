<template>
  <v-autocomplete
    :value="selectedCategory"
    :items="categories"
    item-text="name"
    item-value="id"
    :label="$t('common.category')"
    :placeholder="$t('common.category')"
    :loading="loading"
    :disabled="loading || disabled"
    clearable dense filled rounded outlined
    class="mx-sm-4 external-api-explorer-category-select-filter"
    data-cy="external-api-explorer-category-select-filter"
    @change="setCategory"
  />
</template>

<script>
  import api from "@/library/api.lib";

  export default {
    name: "ExternalApiExplorerCategorySelectFilter",
    props: {
      selectedCategory: {
        type: Number,
        default: null
      },
      disabled: {
        type: Boolean,
      },
    },
    data: () => ({
      loading: false,
      categories: null
    }),
    mounted() {
      this.fetchCategories();
    },
    methods: {
      async fetchCategories() {
        this.loading = true;
        try {
          const response = await api().get(
            "/external-api-courses/categories"
          );
          this.categories = response.data;
          this.loading = false;
        } catch (e) {
          throw new Error(e);
        }
      },

      async setCategory(category) {
        this.$emit("change", category);
      },

    }
  };
</script>

<style scoped>  </style>
