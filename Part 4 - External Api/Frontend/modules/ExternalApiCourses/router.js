import { redirectIfUnAuthenticated } from "@/helpers/RouteAccessChecksHelper";
import { FEATURE } from "@/library/constants";
import i18n from "@/i18n";

export default [
  // Phase 1
  {
    path: "/externalApi/browse",
    name: "externalApiExplorer",
    meta: {
      feature: FEATURE.EXTERNAL_API,
      tracking: {
        inPage: true,
        sections: ["external-api-courses", "external-api-courses", "browse"]
      },
      breadcrumbs: [
        { title: i18n.t("routes.external_api_course_explorer"), routeName: "externalApiExplorer" },
        { title: i18n.t("routes.browse_external_api_courses") },
      ]
    },
    // Phase 1
    // component: () => import(
    //   "@/modules/ExternalApiCourses/pages/index.vue"
    // ),

    // Phase 2
    component: () => import(
      "@/modules/ExternalApiCourses/features/BrowseExternalApiCourses.vue"
    ),
    beforeEnter: async (to, from, next) => {
      // Check user is authenticated
      await redirectIfUnAuthenticated(to, from, next);
    },
  },
  // Phase 2
  {
    path: "/externalApi/user-courses",
    name: "externalApiExplorerUserCourses",
    meta: {
      feature: FEATURE.EXTERNAL_API,
      tracking: {
        inPage: true,
        sections: ["external-api-courses", "external-api-courses", "user-courses"]
      },
      breadcrumbs: [
        { title: i18n.t("routes.external_api_course_explorer"), routeName: "externalApiExplorer" },
        { title: i18n.t("routes.user_courses") },
      ]
    },
    component: () => import(
      "@/modules/ExternalApiCourses/features/UserExternalApiCourses.vue"
    ),
    beforeEnter: async (to, from, next) => {
      // Check user is authenticated
      await redirectIfUnAuthenticated(to, from, next);
    },
  },
];