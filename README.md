# CodingExamples
 Examples of Previous Coding

## Part 1 - Display Portfolio Component & View Model
Simple component to display the portfolios for a selected user account.
Uses Singular Systems in house React-based library and Typescript.

## Part 2 - Normalise Raw Import Data Stored Procedure
A dynamic SQL proc to build an Insert Select script to normalize a set of raw import data based on pre-defined field targets.
Accounts for multiple parent-child relationships.

## Part 3 - Affordability Assessment
A full workflow to record inputs for a predefined set of affordability assessment line items.
The requirements were that the affordability assessment had to be 100% dynamic on all 3 levels (Elements, Groupings, and Items) so that each new client could input their own headings for assessment.
The input fields are built up dynamically from 3 database tables and then the inputs are matched back to coded fields in a different microservice's of the database.
Frontend files: AffordabilityAssessment & AffordabilityAssessmentVM
Backend files: AffordabilityAssessmentController (API) & CreateAffordabilityAssessmentCommandHandler (Logic) & AffordabilityAssessmentRepository (Database)
Included is an old version of the database diagram.

## Part 4 - External Api
We partnered with an external company that provides skills courses to their users.
In our website we decided to
- Show the courses available with some of the main details and a link to that course page on the external company's website. (Phase 1)
- Allow our users to sign into their accounts of the external company and view their current courses in more detail. (Phase 2)
I was tasked with investigating the capabilities of the external api then building both the frontend and backend of the implementation.
We do not store any of the data returned by the external api, but we did discuss caching the data as it is a fairly large dataset.
Phase 1 was completed in its entirety
Phase 2 backend was fully completed, but the frontend is a very basic implementation as it was a backlog task but I wanted to put in the foundation for before I left.
