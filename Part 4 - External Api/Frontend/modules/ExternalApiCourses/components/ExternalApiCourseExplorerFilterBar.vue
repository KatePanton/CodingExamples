<template>
  <PaginatedContentFilterToolBar
    v-slot="toolbar"
    :active-filter-count="activeFilterCount"
    data-cy="external-api-course-explorer-toolbar pt-4"
    @resetFilters="resetFilters"
  >
    <v-spacer />
    <ExternalApiCategorySelectFilter
      :section="section"
      :disabled="disabled"
      :selected-category="selectedCategory"
      @change="handleSelectCategory"
      @change.capture="toolbar.close"
    />

    <ExternalApiTagSelectFilter
      :section="section"
      :disabled="disabled"
      :selected-tag="selectedTag"
      @change="handleSelectTag"
      @change.capture="toolbar.close"
    />
  </PaginatedContentFilterToolBar>
</template>

<script>
import ExternalApiCategorySelectFilter from "@/components/ExternalApiCategorySelectFilter.vue";
import ExternalApiTagSelectFilter from "@/components/ExternalApiTagSelectFilter.vue";
import PaginatedContentFilterToolBar from "@/components/PaginatedContentFilterToolBar.vue"; //Not within the scope of this example
import { mapGetters } from "vuex";

export default {
  name: "ExternalApiCourseExplorerFilterBar",
  components: {
    PaginatedContentFilterToolBar,
    ExternalApiCategorySelectFilter,
    ExternalApiTagSelectFilter,
  },
  props: {
    section: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
    },
  },
  data: () => ({
    loading: true,
  }),
  computed: {
    ...mapGetters("externalApi", ["getSectionCategory", "getSectionTag"]),

    selectedCategory() {
      return this.getSectionCategory(this.section);
    },

    selectedTag() {
      return this.getSectionTag(this.section);
    },

    activeFilterCount() {
      let count = 0;
      const { selectedCategory, selectedTag } = this;
      if (selectedCategory) {
        count++;
      }
      if (selectedTag) {
        count++;
      }
      return count;
    },
  },
  methods: {
    async resetFilters() {
      const { section } = this;
      const update = [
        this.$store.dispatch("externalApi/setSectionCategory", {
          section,
          category: null,
        }),
        this.$store.dispatch("externalApi/setSectionTag", {
          section,
          tag: null,
        }),
      ];
      await Promise.all(update);
      this.$emit("change");
    },

    handleSelectCategory(category) {
      const { section } = this;
      this.$store.dispatch("externalApi/setSectionCategory", {
        section,
        category,
      }),
        this.$emit("change");
    },

    handleSelectTag(tag) {
      const { section } = this;
      this.$store.dispatch("externalApi/setSectionTag", { section, tag }),
        this.$emit("change");
    },
  },
};
</script>

<style scoped></style>
