// Required Project Imports
import axios, { AxiosInstance } from "axios";
import Redis from "./Redis";
import config from "../config";
import md5 from "md5";
import { HydratedUser } from "../models/user";
import logger from "./log_engine";

const log = logger("externalApi");
const baseURL = "https://externalApi.com/api/external/v1/";
const userLocale = "en"; // TODO: Set to user locale
let userExternalApiId = "";

const externalApiClient: AxiosInstance = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

async function setAccessToken(): Promise<void> {
    const response = await externalApiClient.post("access-token", {
        client_id: config.externalApi.clientId,
        client_secret: config.externalApi.clientSecret,
        organization_id: config.externalApi.orgId,
        organization_key: config.externalApi.orgKey,
    });
    externalApiClient.defaults.headers.common.Authorization = `Bearer ${response.data.access_token}`;
    log("Access token fetched");
}

async function updateAccessToken() {
    if (!externalApiClient.defaults.headers.common.Authorization) {
        await setAccessToken();
    }
}

export async function getCategories() {
    await updateAccessToken();
    const redis = Redis.getInstance();
    const cacheKey = "ExternalApi:categories";

    return await redis.fetchCached(cacheKey, async () => {
        const response = await externalApiClient.get("categories");
        return await setupCategoriesObject(response.data);
    });
}

async function setupCategoriesObject(dataObject) {
    const categories = [];

    for (const category of dataObject.data) {
        const translation = category.translations.find(
            (translation) =>
                translation.locale === userLocale || translation.locale === "en"
        );

        const categoryData = {
            id: category.id,
            name: translation.name,
            slug: translation.slug,
        };
        if (category.courses_count > 0) {
            categories.push(categoryData);
        }
    }

    categories.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });

    return categories;
}

export async function getTags() {
    await updateAccessToken();
    const redis = Redis.getInstance();
    const cacheKey = "ExternalApi:tags";

    return await redis.fetchCached(cacheKey, async () => {
        const response = await externalApiClient.get("tags");
        return await setupTagsObject(response.data);
    });
}

async function setupTagsObject(dataObject) {
    const tags = [];

    for (const tag of dataObject.data) {
        const translation = tag.translations.find(
            (translation) =>
                translation.locale === userLocale || translation.locale === "en"
        );

        const tagData = {
            id: tag.id,
            name: translation.name,
            slug: translation.slug,
        };
        if (tag.courses_count > 0) {
            tags.push(tagData);
        }
    }

    tags.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });

    return tags;
}

export async function getCourses(params) {
    await updateAccessToken();

    const response = await axiosCallWithRedis(params);
    const courseData = setupCoursesObject(response);
    return await paginate(courseData, params);
}

async function axiosCallWithRedis(params) {
    const redis = Redis.getInstance();
    const cacheKey = md5("courses" + JSON.stringify(params));

    return await redis.fetchCached(cacheKey, async () => {
        const response = await externalApiClient.get("courses", {
            params: {
                page: params.page,
                per_page: params.perPage,
                category_id: params.category,
                tag_id: params.tag,
                sort: "name",
            },
        });
        return response.data;
    });
}

function setupCoursesObject(courseData) {
    const courses = [];

    for (const course of courseData.data) {
        const publisher = course.publishers.find((pub) => pub.name);
        const translation = course.translations.find(
            (translation) =>
                translation.locale === userLocale || translation.locale === "en"
        );

        const categories = course.categories.map((cat) => cat.id);
        const tags = course.tags.map((tag) => tag.id);

        const courseData = {
            id: course.id,
            name: course.name,
            slug: course.slug,
            type: course.type,
            language: course.language,
            categories,
            tags,
            publisherName: publisher?.name || null,
            publisherLocation: publisher?.location || null,
            headline: translation?.headline || null,
            summary: translation?.summary || null,
            image: course.image,
            url: course.url,
            duration_avg: course.duration_avg,
            rating_avg: course.rating_avg,
            ratings_count: course.ratings_count,
        };

        courses.push(courseData);
    }
    courses.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });

    return { courses: courses, meta: courseData.meta };
}

export async function registerUser(user: HydratedUser) {
    await updateAccessToken();
    log("Register user.");
    const response = await externalApiClient.post("register", {
        email: user.email,
        firstname: user.profile.firstName,
        lastname: user.profile.lastName,
        city: "TODO",
        country: "TODO",
    });
    log("Registration complete.");
    return response.data;
}

export async function loginUser(user: HydratedUser) {
    await updateAccessToken();

    const response = await externalApiClient.post("login", {
        email: user.email,
    });
    return response.data;
}

// USER DETAILS
export async function getUserDetails(params) {
    await updateAccessToken();
    const response = await externalApiClient.get("users/get-user", {
        params: {
            email: params.email,
        },
    });
    if (response.status === 200) {
        const externalApiUser = await setupExternalApiUserObject(response.data);
        userExternalApiId = externalApiUser.id;
    }
    return response.data;
}
async function setupExternalApiUserObject(dataObject) {
    const data = dataObject.data;

    return {
        id: data.id,
        email: data.email,
        firstName: data.firstname,
        lastName: data.lastname,
        phone: data.phone,
        isPublic: data.is_public,
        avatar: data.avatar,
        countryId: data.country_id,
        verified: data.verified,
    };
}

export async function getUserCourses(params) {
    if (userExternalApiId === "") {
        await getUserDetails(params);
    }
    await updateAccessToken();
    const response = await externalApiClient.get(`users/${userExternalApiId}/courses`);
    const courseData = await setupCoursesObject(response.data);
    return await paginate(courseData, params);
}

export async function getUserDetailedCourses(params) {
    if (userExternalApiId === "") {
        await getUserDetails(params);
    }
    await updateAccessToken();
    const response = await externalApiClient.get(
        `users/${userExternalApiId}/courses/detailed`
    );
    const courseData = await setupDetailedCoursesObject(response.data);
    return await paginate(courseData, params);
}

async function setupDetailedCoursesObject(courseData) {
    const courses = [];

    for (const course of courseData.data) {
        const publisher = course.publishers.find((pub) => pub.name);
        const translation = course.translations.find(
            (translation) =>
                translation.locale === userLocale || translation.locale === "en"
        );

        const categories = course.categories.map((cat) => cat.id);
        const tags = course.tags.map((tag) => tag.id);

        const courseData = {
            id: course.id,
            name: course.name,
            slug: course.slug,
            type: course.type,
            language: course.language,
            categories,
            tags,
            publisherName: publisher?.name || null,
            publisherLocation: publisher?.location || null,
            headline: translation?.headline || null,
            summary: translation?.summary || null,
            image: course.image,
            url: course.url,
            duration_avg: course.duration_avg,
            rating_avg: course.rating_avg,
            ratings_count: course.ratings_count,
            //  New content
            firstAccess: course.first_access,
            enrollmentDate: course.enrollment_date,
            lastAccess: course.last_access,
            totalTimeSpent: course.total_time_spent,
            courseState: course.course_state,
            courseStatus: course.course_status,
            courseValue: course.course_value,
            scores: course.scores,
        };

        courses.push(courseData);
    }
    courses.sort((a, b) => {
        if (a.lastAccess < b.lastAccess) {
            return -1;
        }
        if (a.lastAccess > b.lastAccess) {
            return 1;
        }
        return 0;
    });

    return { courses: courses, meta: courseData.meta };
}

async function paginate(courseData, params) {
    const totalCount = courseData.meta.total;
    const totalPages = Math.ceil(totalCount / params.perPage);
    let pageNumber = params.page;

    // Ensure the page number is within a valid range
    if (pageNumber <= 1) pageNumber = 1;
    else if (pageNumber > totalPages) pageNumber = totalPages;

    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;
    const nextPage = hasNextPage ? pageNumber + 1 : null;
    const prevPage = hasPrevPage ? pageNumber - 1 : 0;

    return {
        docs: courseData.courses,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        limit: params.perPage,
        nextPage: nextPage,
        page: params.page,
        prevPage: prevPage,
        totalDocs: totalCount,
        totalPages: totalPages,
    };
}