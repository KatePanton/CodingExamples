import { Request, Response, Application } from "express";
import { controller } from "../lib";
import {
  registerUser,
  loginUser,
  getUserDetails,
  getUserCourses,
  getUserDetailedCourses,
  getCourses,
  getCategories,
  getTags,
} from "../lib/external-api";

import { Feature } from "@CompanyCT/sdk";

module.exports = function (app: Application) {
  const { loggedIn, featureGuard } = app;
  app.get("/external-api-courses/paginate", [loggedIn, featureGuard(Feature.ExternalApi)], controller(paginate));
  app.get("/external-api-courses/categories", [loggedIn, featureGuard(Feature.ExternalApi)], controller(categoriesList));
  app.get("/external-api-courses/tags", [loggedIn, featureGuard(Feature.ExternalApi)], controller(tagsList));

  app.post("/external-api-courses/register-user", [loggedIn, featureGuard(Feature.ExternalApi)], controller(registerExternalApiUser));
  app.post("/external-api-courses/login-user", [loggedIn, featureGuard(Feature.ExternalApi)], controller(logInExternalApiUser));
  app.get("/external-api-courses/get-user-details", [loggedIn, featureGuard(Feature.ExternalApi)], controller(getExternalApiUserDetails));
  app.get("/external-api-courses/get-user-courses", [loggedIn, featureGuard(Feature.ExternalApi)], controller(getExternalApiUserCourses));
  app.get("/external-api-courses/get-user-courses-detailed", [loggedIn, featureGuard(Feature.ExternalApi)], controller(getExternalApiUserDetailedCourses));
};

/**
 * @api {get} /external-api-courses/register-user
 * @apiName registerUser
 * @apiGroup ExternalApiCourses
 * @apiDescription Register a user on ExternalApi with their email.
 */
async function registerExternalApiUser(req: Request, res: Response) {
  try {
    const data = await registerUser(req.user);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(e.response.status).json(e.response.data);
  }
}

/**
 * @api {get} /external-api-courses/login-user
 * @apiName loginUser
 * @apiGroup ExternalApiCourses
 * @apiDescription Log in a user on ExternalApi with their email.
 */
async function logInExternalApiUser(req: Request, res: Response) {
  const data = await loginUser(req.user);
  return res.status(200).json(data);
}

/**
 * @api {get} /external-api-courses/get-user-details
 * @apiName getUserDetails
 * @apiGroup ExternalApiCourses
 * @apiDescription Get details for user on ExternalApi with their email.
 */
async function getExternalApiUserDetails(req: Request, res: Response) {
  const data = await getUserDetails(req.query);
  return res.status(200).json(data);
}

/**
 * @api {get} /external-api-courses/get-user-courses
 * @apiName getUserCourses
 * @apiGroup ExternalApiCourses
 * @apiDescription Get course details for user on ExternalApi with their Id.
 */
async function getExternalApiUserCourses(req: Request, res: Response) {
  const data = await getUserCourses(req.query);
  return res.status(200).json(data);
}

/**
 * @api {get} /external-api-courses/get-user-courses-detailed
 * @apiName getUserCourses
 * @apiGroup ExternalApiCourses
 * @apiDescription Get extended course details for user on ExternalApi with their Id.
 */
async function getExternalApiUserDetailedCourses(req: Request, res: Response) {
  const data = await getUserDetailedCourses(req.query);
  return res.status(200).json(data);
}

/**
 * @api {get} /external-api-courses/paginate
 * @apiName paginate
 * @apiGroup ExternalApiCourses
 * @apiDescription Fetch all ExternalApi Courses as a paginated list.
 */
async function paginate(req: Request, res: Response) {
  const data = await getCourses(req.query);
  return res.status(200).json(data);
}

/**
 * @api {get} /categories
 * @apiName categories
 * @apiGroup ExternalApiCourses
 * @apiDescription Fetch all ExternalApi Course Categories as a list.
 */
async function categoriesList(req: Request, res: Response) {
  const data = await getCategories();
  return res.status(200).json(data);
}

/**
 * @api {get} /external-api-courses/tags
 * @apiName tags
 * @apiGroup ExternalApiCourses
 * @apiDescription Fetch all ExternalApi Course Tags as a list.
 */
async function tagsList(req: Request, res: Response) {
  const data = await getTags();
  return res.status(200).json(data);
}
