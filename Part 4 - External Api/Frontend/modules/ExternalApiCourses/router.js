import {
  redirectIfUnAuthenticated,
  sectionBlock
} from "@/helpers/RouteAccessChecksHelper";
import {FEATURE} from "@/library/constants";
import i18n from "@/i18n";

export default [
  {
    path: "/externalApi/browse",
    name: "externalApiExplorer",
    meta: {
      feature: FEATURE.EXTERNAL_API,
      tracking: {
        inPage: true,
        sections: ["external-api-courses", "browse"],
      },
      breadcrumbs: [
        { title: i18n.t("routes.external_api_course_explorer"), routeName: "externalApiExplorer" },
        { title: i18n.t("routes.browse_external_api_courses") },
      ]
    },
    component: () => import(
      "@/modules/ExternalApiCourses/pages/index.vue"
    ),
    beforeEnter: async (to, from, next) => {
      // Check user is authenticated
      await redirectIfUnAuthenticated(to, from, next);
      sectionBlock(to, from, next);
    },
  },
];