<template>
  <div>
    <ExternalApiSectionToolbar />

    <!-- User Details -->
    <v-row v-if="userData" class="external-api-user-details pl-8 pb-4">
      <v-col
        v-if="userData.firstName || userData.lastname"
        cols="12"
        md="6"
        class=""
      >
        <v-row class="pt-8 pb-4 mx-auto">
          <h2>Welcome {{ userData.firstname }} {{ userData.lastname }}</h2>
        </v-row>

        <v-row v-if="userData.email" class="px-4">
          Email: {{ userData.email }}
        </v-row>

        <v-row v-if="userData.phone" class="px-4">
          Phone: {{ userData.phone }}
        </v-row>
      </v-col>

      <v-col cols="12" md="6" class="">
        <v-img
          v-if="userData.avatar"
          class="hidden-sm-and-down"
          height="100px"
          width="100px"
          :src="userData.avatar"
        />
      </v-col>
    </v-row>

    <!-- Course Details -->
    <v-row v-if="detailedUserCourses">
      <v-col
        v-for="course in detailedUserCourses.docs"
        :key="course.id"
        cols="12"
        sm="12"
        md="6"
        class="px-8 pb-8"
      >
        <ExternalApiUserCourseContentCard :external-api-course="course" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ExternalApiSectionToolbar from "@/modules/ExternalApiCourses/components/ExternalApiSectionToolbar.vue";
import ExternalApiUserCourseContentCard from "@/modules/ExternalApiCourses/components/ExternalApiUserCourseContentCard.vue";
import translations from "@/i18n.js";

export default {
  name: "UserExternalApiCoursesPage",
  i18n: translations,
  components: {
    ExternalApiSectionToolbar,
    ExternalApiUserCourseContentCard,
  },
  data: () => ({
    section: "user",
    userData: {},
    detailedUserCourses: {},
    testerEmail: "email@email.com", // ToDo: remove hardcoded value, only use for initial testing
  }),
  mounted() {
    this.fetchUserData();
    this.fetchDetailedUserData();
  },
  methods: {
    async fetchUserData() {
      const response = await this.$store.dispatch(
        "externalApi/fetchExternalApiUserDetails",
        this.testerEmail
      );
      this.userData = response.data;
    },

    async fetchDetailedUserData() {
      this.detailedUserCourses = await this.$store.dispatch(
        "externalApi/fetchDetailedUserCourses",
        this.testerEmail
      );
    },
  },
};
</script>

<style scoped></style>
