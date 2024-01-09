<template>
  <SectionToolbar
    :sections="sections"
    :selected-section="`${section}`"
    :show-menu="false"
    class="external-api-courses-section-toolbar-component"
    data-cy="external-api-courses-section-toolbar-component"
  />
</template>

<script>
import SectionToolbar from "@/components/SectionToolbar.vue"; //Not within the scope of this example
import translations from "@/i18n.js";

export default {
  name: "ExternalApiSectionToolbar",
  i18n: translations,
  components: {
    SectionToolbar,
  },
  computed: {
    sections() {
      return [
        {
          icon: "fa-magnifying-glass",
          name: this.$t("external_api.browse_courses"),
          key: "externalApiExplorer",
          routeName: "externalApiExplorer",
        },
      ];
    },

    section() {
      return this.$route.name;
    },
  },

};
</script>

<style scoped>  </style>
