<template>
  <v-container class="paginated-content-cards" data-cy="paginated-content-cards" fluid>

    <!--Content Cards-->
    <v-container
      fluid
      class="paginated-explorer-content-list px-0 pt-0 grey lighten-3"
    >
      <v-container fluid class="pa-3">
        <slot />
      </v-container>
    </v-container>

    <!--No results-->
    <v-row
      v-if="showNoResults && !loading"
      class="paginated-content-cards-no-results"
      data-cy="paginated-content-cards-no-results"
    >
      <v-col cols="12" class="text-center pt-12 pb-12">
        <h1 class="grey--text">
          {{ $t("common.no_matches_for_selection") }}
        </h1>
      </v-col>
    </v-row>

    <!--Skeleton Loader-->
    <v-container
      v-if="loading"
      class="pa-3 paginated-content-cards-skeleton-loader"
      data-cy="paginated-content-cards-skeleton-loader"
      fluid
    >
      <v-row>
        <v-col
          v-for="n in 12"
          :key="n"
          cols="12" sm="6" md="4"
        >
          <v-skeleton-loader
            class="mx-auto"
            type="card"
          />
        </v-col>
      </v-row>
    </v-container>

    <!--Load More Button-->
    <v-row v-if="!showNoResults">
      <v-col cols="12" class="text-center">
        <v-btn
          v-if="showLoadMoreButton"
          data-cy="paginated-content-cards-load-more-button"
          :loading="loading"
          :disabled="loading"
          class="secondary ma-auto mt-4 paginated-content-cards-load-more-button"
          @click="$emit('load-more-button-clicked')"
        >
          {{ $t("common.load_more") }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  /**
   * A paginated content cards component for content explorers
   *
   * Recommended usage:
   * 1. Include this component in the explorer where you wish to show paginated cards
   * 2. Handle the load-more-button-clicked and scroll-to-bottom events in the explorer
   * 3. Use the slot to show the Content Cards
   *
   * Events Emitted:
   * - load-more-button-clicked emitted when the load more button is clicked
   * - scroll-to-bottom emitted when the user scrolls to the bottom of the page
   */

  export default {
    name: "PaginatedContentCards",
    props: {
      showLoadMoreButton: {
        type: Boolean,
        required: true,
        default: false
      },
      showNoResults: {
        type: Boolean,
        required: true,
        default: false
      },
      loading: {
        type: Boolean,
        required: true,
        default: false
      },
    },
    data() {
      return {
        bottom: false,
      };
    },
    watch: {
      /**
       * Watches when the user gets to the bottom of the page
       * Emits an event when they do
       * @param bottom - Whether the bottom of the page is visible
       * @returns {Promise<void>}
       */
      async bottom(bottom) {
        const { loading, showLoadMoreButton } = this;
        if (bottom) {
          if (!loading && showLoadMoreButton) {
            this.$emit("scroll-to-bottom");
          }
        }
      }
    },
    created() {
      /**
       * Event listener to monitor the scroll position of the page
       */
      window.addEventListener("scroll", () => {
        this.bottom = this.isBottomVisible();
      });
    },
    beforeDestroy() {
      // Cleanup the scroll listener
      window.removeEventListener("scroll", () => {});
    },
    methods: {
      /**
       * Checks if the bottom of the page is visible
       * @returns {boolean} - Whether the bottom of the page is visible
       */
      isBottomVisible() {
        const scrollY = window.scrollY;
        const visible = document.documentElement.clientHeight;
        const pageHeight = document.documentElement.scrollHeight;
        const bottomOfPage = visible + scrollY >= pageHeight;
        return bottomOfPage || pageHeight < visible;
      },
    }
  };
</script>

<style scoped>  </style>
