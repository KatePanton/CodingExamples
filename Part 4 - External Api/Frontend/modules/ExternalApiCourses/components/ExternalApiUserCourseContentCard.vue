<template>
  <v-card
    class="external-api-user-course-content-card card-outer"
    outlined
    elevation="2"
    height="100%"
  >
    <div
      class="v-card-content article-content-card-content"
      :style="description ? 'min-height: 130px;' : 'min-height: 0;'"
      data-cy="contentCard"
    >
      <!-- Title -->
      <v-card-title class="tertiary-skill-card-title px-4">
        {{ title }}
      </v-card-title>

      <v-card-text class="article-content-card-description px-4">
        <!-- Title & Description -->
        <div v-if="description" class="pb-2">
          {{ description }}
        </div>

        <!-- User's Course Info-->
        <v-row>
          <v-col
            v-for="{ name, value } in courseSpecifics"
            :key="name"
            cols="12"
            sm="12"
            md="6"
          >
            <div v-if="value">
              <div class="font-weight-bold pt-2 pb-1">{{ name }}:</div>
              {{ value }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </div>

    <v-card-actions
      class="article-content-card-actions pa-4 mt-auto card-actions"
    >
      <v-btn
        color="primary-button primary-button-text--text"
        class="rounded mr-4 text-uppercase"
        data-cy="openContentButton"
        @click="openCourseLink"
      >
        {{ buttonText }}
        <v-icon>fa-chevron-right</v-icon>
      </v-btn>
      <v-spacer />
    </v-card-actions>
  </v-card>
</template>

<script>
import translations from "@/i18n.js";

export default {
  name: "ExternalApiUserCourseContentCard",
  i18n: translations,
  props: {
    externalApiCourse: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    buttonText: "Open Course",
    courseSpecifics: {},
  }),
  computed: {
    description() {return this.externalApiCourse.headline;},
    title() {return this.externalApiCourse.name;},
  },
  mounted() {
    this.setupCourseSpecifics();
  },
  methods: {
    setupCourseSpecifics() {
      this.courseSpecifics = {
        firstAccess: {name: "firstAccess", value: this.externalApiCourse.firstAccess,},
        enrollmentDate: {name: "enrollmentDate", value: this.externalApiCourse.enrollmentDate,},
        lastAccess: {name: "lastAccess", value: this.externalApiCourse.lastAccess,},
        totalTimeSpent: {name: "totalTimeSpent", value: this.externalApiCourse.totalTimeSpent,},
        courseState: {name: "courseState", value: this.externalApiCourse.courseState,},
        courseStatus: {name: "courseStatus", value: this.externalApiCourse.courseStatus,},
        courseValue: {name: "courseValue", value: this.externalApiCourse.courseValue,},
        scores: { name: "scores", value: this.externalApiCourse.scores },
      };
    },

    openCourseLink() {
      // Open the course in a new window
      window.open(this.externalApiCourse.url, "_blank");
    },
  },
};
</script>

<style scoped></style>
