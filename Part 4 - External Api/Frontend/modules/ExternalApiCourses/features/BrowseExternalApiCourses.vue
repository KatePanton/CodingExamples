<template>
  <div
    class="browse-external-api-courses-explorer"
    data-cy="browse-external-api-courses-explorer"
  >
    <ExternalApiSectionToolbar />

    <ExternalApiCourseExplorerFilterBar
      :section="section"
      :disabled="loadingPages"
      class="browse-external-api-courses-explorer-toolbar"
      data-cy="browse-external-api-courses-explorer-toolbar"
      @change="resetAndFetch"
    />

    <PaginatedContentCards
      :show-load-more-button="morePages"
      :show-no-results="!docs.length"
      :loading="loadingPages"
      class="browse-external-api-courses-explorer-paginated-cards"
      data-cy="browse-external-api-courses-explorer-paginated-cards"
      @load-more-button-clicked="fetch()"
      @scroll-to-bottom="fetch()"
    >
      <v-row>
        <v-col
          v-for="contentItem in docs"
          :key="contentItem._id"
          cols="12"
          sm="6"
          md="4"
        >
          <ExternalApiCourseContentCard
            :external-api-course="contentItem"
            class="browse-external-api-courses-explorer-paginated-cards-external-api-course-card"
            data-cy="browse-external-api-courses-explorer-paginated-cards-external-api-course-card"
          />
        </v-col>
      </v-row>
    </PaginatedContentCards>
  </div>
</template>

<script>
import ExternalApiCourseContentCard from "@/modules/ExternalApiCourses/components/ExternalApiCourseContentCard.vue";
import ExternalApiCourseExplorerFilterBar from "@/modules/ExternalApiCourses/components/ExternalApiCourseExplorerFilterBar.vue";
import PaginatedContentCards from "@/components/PaginatedContentCards.vue";
import ExternalApiSectionToolbar from "@/modules/ExternalApiCourses/components/ExternalApiSectionToolbar.vue";
import { mapGetters } from "vuex";
import translations from "@/i18n.js";

export default {
  name: "BrowseExternalApiCourses",
  i18n: translations,
  components: {
    ExternalApiSectionToolbar,
    ExternalApiCourseExplorerFilterBar,
    PaginatedContentCards,
    ExternalApiCourseContentCard,
  },
  data: () => ({
    loadingPages: true,
    section: "browse",
  }),
  computed: {
    ...mapGetters("externalApi", ["getSectionPages", "hasSectionGotMorePages"]),

    pages() {
      return this.getSectionPages(this.section);
    },

    morePages() {
      if (!this.loadingPages) return this.hasSectionGotMorePages(this.section);

      return false;
    },

    docs() {
      const docs = [];

      for (const page of this.pages) {
        docs.push(...page.docs);
      }

      return docs;
    },
  },
  mounted() {
    this.fetch();
  },
  methods: {
    async resetAndFetch() {
      this.loadingPages = true;
      await this.$store.dispatch("externalApi/clearSectionPages", this.section);
      await this.$store.dispatch("externalApi/fetchCourses", this.section);
      this.loadingPages = false;
    },

    async fetch() {
      this.loadingPages = true;
      await this.$store.dispatch("externalApi/fetchCourses", this.section);
      this.loadingPages = false;
    },
  },
};
</script>

<style scoped></style>
