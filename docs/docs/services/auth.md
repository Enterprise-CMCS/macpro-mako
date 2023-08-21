---
layout: default
title: auth
parent: Services
---

# auth
{: .no_toc }

## Summary
The auth service builds the infrastructure for our authentication and authorization solution:  Amazon Cognito.  A user pool and identity pool is deployed, and may conditionally be pointed to IDM (external identity provider).

## Detail
The core of the api service is a cognito user pool and identity pool, which work together to provide an auth solution:
- user pool:  this is the user directory, where all active users and their attributes are stored.
    - This is where we specify the user attribute schema, informed by but not beholden to IDM.
    - The attribute schema is difficiult to update, and often requires deleting the user pool.  This is acceptable for two reasons.  One, updating the attribute schema would be a rare event.  Two, since in higher environments all users are federated, the user pool itself holds no unique data; as such, it is safe to delete and simply rebuild without having data loss.
- identity pool:  this is associated with the user pool, and allows us to grant certain AWS permissions to authenticated and/or unauthenticated entities.
    - authenticated users may assume a role that gives them permissions to invoke the api gateway, as well as see information about their own cognito user.
    - unauthenticated user may assume a role that gives them no permissions.

In the near future, higher environments will configure IDM as an external identity provider.  Ephemeral/dev environments will continue to use only the cognito user pool.