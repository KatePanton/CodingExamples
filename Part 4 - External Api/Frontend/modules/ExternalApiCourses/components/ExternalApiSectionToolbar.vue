<template>
  <SectionToolbar
    :sections="sections"
    :selected-section="`${section}`"
    :show-menu="false"
    :show-sub-toolbar="false"
    :disabled="false"
    class="external-api-courses-section-toolbar-component"
    data-cy="external-api-courses-section-toolbar-component"
    @click="changeSection($event)"
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
        {
          icon: "fa-user",
          name: this.$t("external_api.user_courses"),
          key: "externalApiUserCourses",
          routeName: "externalApiUserCourses",
        },
      ];
    },

    section() {
      return this.$route.name;
    },
  },
  methods: {
    changeSection(section) {
      this.sections.filter((tab) => {
        if (tab.key === section && this.$route.name !== tab.routeName) {
          return this.$router.push({ name: tab.routeName });
        }
        return null;
      });
    },
  },
};
</script>

<style scoped></style>
