import api from "@/library/api.lib";
import { cloneDeep } from "lodash";

const getDefaultState = () => ({
  section: null,
  browse: cloneDeep(defaultSection),
});

// Default setup for a section
const defaultSection = {
  pages: [],
  category: null,
  tag: null,
};

export default {
  namespaced: true,
  state: getDefaultState,
  actions: {
    /**
     * Fetches a paginated list of External Api Courses for a specific section.
     *
     * @param section The section of articles we are loading
     * @returns {Promise<void>}
     */
    async fetchCourses({ state, commit }, section) {
      let response;

      // Build the params for the current fetch call
      const params = buildParams(state, section);

      // Fetch the requested content type from the API
      try {
        response = await api().get(
          "/external-api-courses/paginate",
          { params }
        );
      } catch (e) {
        throw new Error(e);
      }
      commit("ADD_PAGES", { page: response.data, section });
    },

    /**
     * Sets the current category for a section
     * @param commit
     * @param category The selected category
     */
    setSectionCategory({ commit }, { section, category }) {
      commit("SET_SECTION_CATEGORY", { section, category });
    },

    /**
     * Sets the current tag for a section
     * @param commit
     * @param tagId The selected tag
     */
    setSectionTag({ commit }, { section, tag }) {
      commit("SET_SECTION_TAG", { section, tag });
    },

    /**
     * Resets the state for a section
     * @param commit
     * @param section The section to reset
     */
    resetSection({ commit }, section) {
      commit("RESET_SECTION", section);
    },

    /**
     * Clears the pages for a section
     * @param commit
     * @param section The section to clear the pages for
     */
    clearSectionPages({ commit }, section) {
      commit("CLEAR_SECTION_PAGES", section);
    },

    // logInExternalApiUser - Still outstanding

    /**
     * Fetches the basic details of the External Api User based on their email.
     *
     * @param email The email of the user
     * @returns {Promise<void>}
     */
    async fetchExternalApiUserDetails(email) {
      let response;

      // Build the params for the current fetch call
      const params = {
        email: email
      };

      // Fetch the requested content type from the API
      try {
        response = await api().get(
          "/external-api-courses/get-user-details",
          { params }
        );
      } catch (e) {
        throw new Error(e);
      }
      return response.data;
    },

    // getExternalApiUserDetailedCourses
    /**
     * Fetches the user details and in-depth details for their courses for the External Api User based on their email.
     *
     * @param email The email of the user
     * @returns {Promise<void>}
     */
    async fetchDetailedUserCourses(email) {
      let response;

      // Build the params for the current fetch call
      const params = {
        email: email
      };

      // Fetch the requested content type from the API
      try {
        response = await api().get(
          "/external-api-courses/get-user-courses-detailed",
          { params }
        );
      } catch (e) {
        throw new Error(e);
      }
      return response.data;
    },
  },

  getters: {
    getSectionCategory: (state) => (section) => state[section].category,
    getSectionTag: (state) => (section) => state[section].tag,
    getSectionPages: (state) => (section) => state[section].pages,
    hasSectionPages: (state) => (section) => state[section].pages.length > 0,
    hasSectionGotMorePages: (state) => (section) => state[section].pages && state[section].pages[0] && state[section].pages[0].hasNextPage,
    getUserDetails: (state) => (section) => state[section],
  },

  mutations: {
    SET_SECTION_CATEGORY(state, { section, category }) {
      state[section].category = category;
    },
    SET_SECTION_TAG(state, { section, tag }) {
      state[section].tag = tag;
    },
    ADD_PAGES(state, { page, section }) {
      state[section].pages.push(page);
    },
    RESET_SECTION(state, section) {
      state[section] = cloneDeep(defaultSection);
    },
    CLEAR_SECTION_PAGES(state, section) {
      state[section].pages = [];
    },
  }
};

/**
 * Builds the query params for a specified section based on the state
 *
 * @param state The current state
 * @param section The section we are building the params for
 * @returns {{perPage: number, page: *}}
 */
function buildParams(state, section) {
  const activeSection = state[section];
  const { pages, category, tag } = activeSection;

  const params = {
    page: pages.length + 1,
    perPage: 9,
    category: category,
    tag: tag,
  };
  return params;
}
