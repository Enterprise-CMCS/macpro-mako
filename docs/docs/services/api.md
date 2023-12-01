---
layout: default
title: api
parent: Services
---

# api
{: .no_toc }

## Summary

The api service deploys a lambda-backed API Gateway that is used by the frontend to interact with the data layer.  Access to any of its endpoints is guarded at a high level by AWS Cognito, ensuring only authenticated users may reach it.  The lambda functions that back each endpoint enforce further fine-grain access according to business rules.


## Detail

The largest component of the api service is the API Gateway itself.  This is a standard deployment of a regional, REST API Gateway.  We do not apply custom certificates or DNS names to the api gateway endpoint (yet); instead, our application uses the amazon generated SSL endpoint.  

There are four endpoints on the api.  Each is guarded by AWS IAM, meaning that while the API Gateway is publicly available, the API will not forward your request to the backing lambda unless you provide valid credentials obtained through AWS Cognito.  This way, only users with an account that we can authenticate may successfully call endpoints.  The four endpoints are:
- /search (POST):  This endpoint accepts search queries from clients in the form of OpenSearch Query DSL queries.  Once the query is received, the lambda adds extra query filters to ensure fine grain auth.  This works by looking up the user making the call in Cognito, determining what type of user (cms or state) is making the call, determining what states that user has access to (if appropriate), and modifying the query in a way that will only return results for those states.  By design, the only thing the search endpoint adds is related to authentication; the rest of the query building is left to the frontend for faster and more flexible development.
- /item (POST):  The item endpoint is used to fetch details for exactly one record.  While you can form a query to do this and use the search endpoint, the item endpoint is for convenience.  Simply make a post call containing the ID of the desired record to the item endpoint, and the record will be returned.  Note that fine grain auth is still enforced in an identical way to search, whereby you will only obtain results for that ID if you should have access to that ID.
- /getAttachmentUrl (POST):  This endpoint is used to generate a presigned url for direct client downloading of S3 data, enforcing fine grain auth along the way.  This is how we securely allow download of submission attachment data.  From the details page, a user may click a file to download.  Once clicked, their client makes a post to /getAttachmentUrl with the attachment metadata.  The lambda function determines if the caller should or should not have access based on identical logic as the other endpoints (the UI would not display something they cannot download, but this guards against bad actors).  If access is allowed, the lambda function generates a presigned url good for 60 seconds and returns it to the client browser, at which point files are downloaded automatically.
- /forms (GET):  This endpoint function serves as the backend for handling forms and their associated data. This function provides various features, including retrieving form data, validating access, and serving the requested form content. The request to this endpoint must include a formId in the request body. Optionally, you can include a formVersion parameter. If you access this endpoint with formId without specifying formVersion, it will return the latest version. Form schemas are stored in a Lambda layer. Each form is organized in its directory, and each version is stored within that directory. The Lambda layer is located in the "opt" directory when deployed to aws. To access a specific version of a form with a formId, use the following URL structure: /opt/${formId}/v${formVersion}.json. The JSON form schemas are versioned and stored in Git under the "api/layers" directory.

All endpoints and backing functions interact with the OpenSearch data layer.  As such, and because OpenSearch is deployed within a VPC, all lambda functions of the api service are VPC based.  The functions share a security group that allows outbound traffic.  

All function share an IAM role.  This is for convenicence; we can do one role per function if we find that valuable.  The permissions include:
- OpenSearch permissions to allow access to the data layer
- Cognito permissions to look up user attributes; allows for enforcement of fine grain auth.
- AssumeRole permissions for a very specific cross account role, which is required to generate the presigned urls for the legacy OneMac data.

