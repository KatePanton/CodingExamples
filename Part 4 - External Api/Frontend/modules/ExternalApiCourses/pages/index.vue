<!--
  Only used in phase 1.
  Phase 2 uses the site wide explorer functionality coupled with the section toolbar to control which pages are shown.
-->

<template>
  <AuthenticatedLayout
    :page-title="$t('external_api.browse_external_api_courses')"
    class="external-api-courses-explorer-page"
    data-cy="external-api-courses-explorer-page"
  >
    <ExternalApiSectionToolbar />
    <BrowseExternalApiCourses />
  </AuthenticatedLayout>
</template>

<script>
import AuthenticatedLayout from "@/layout/AuthenticatedLayout.vue";
import BrowseExternalApiCourses from "@/modules/ExternalApiCourses/features/BrowseExternalApiCourses.vue";
import ExternalApiSectionToolbar from "@/modules/ExternalApiCourses/components/ExternalApiSectionToolbar.vue";
import translations from "@/i18n.js";

export default {
  name: "BrowseExternalApiCoursesPage",
  i18n: translations,
  components: {
    AuthenticatedLayout,
    ExternalApiSectionToolbar,
    BrowseExternalApiCourses,
  },
};
</script>

<style scoped></style>
