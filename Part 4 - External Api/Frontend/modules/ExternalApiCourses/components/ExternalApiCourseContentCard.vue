<template>
  <ContentCard
    :title="externalApiCourse.name"
    :image="`${externalApiCourse.image}?h=500`"
    :action-button-text="$t('external_api.open_external_api_course')"
    :description="externalApiCourse.headline"
    class="external-api-course-content-card"
    height="100%"
    data-cy="external-api-course-content-card"
    @click="openCourseLink(externalApiCourse)"
  />
</template>

<script>
import ContentCard from "@/components/explorers/ContentCard.vue"; //Not within the scope of this example
import translations from "@/i18n.js";

export default {
  name: "ExternalApiCourseContentCard",
  i18n: translations,
  components: { ContentCard },
  props: {
    externalApiCourse: {
      type: Object,
      required: true,
    },
  },
  methods: {
    openCourseLink() {
      // Open the course in a new window
      window.open(this.externalApiCourse.url, "_blank");
    },
  },
};
</script>

<style scoped></style>
