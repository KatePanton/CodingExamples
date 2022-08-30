# CodingExamples
 Examples of Previous Coding

Part 1 - Display Portfolio Component & View Model
Simple component to display the portfolios for a selected user account.
Uses Singular Systems in house React-based library and Typescript.

Part 2 - Normalise Raw Import Data Stored Procedure
A dynamic SQL proc to build an Insert Select script to normalize a set of raw import data based on pre-defined field targets.
Accounts for multiple parent-child relationships.

Part 3 - Affordability Assessment
A full workflow to record inputs for a predefined set of affordability assessment line items.
The requirements were that the affordability assessment had to be 100% dynamic on all 3 levels (Elements, Groupings, and Items) so that each new client could input their own headings for assessment.
The input fields are built up dynamically from 3 database tables and then the inputs are matched back to coded fields in a different microservice's of the database.
Frontend files: AffordabilityAssessment & AffordabilityAssessmentVM
Backend files: AffordabilityAssessmentController (API) & CreateAffordabilityAssessmentCommandHandler (Logic) & AffordabilityAssessmentRepository (Database)
Included is an old version of the database diagram.
