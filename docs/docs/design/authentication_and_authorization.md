---
layout: default
title: Auth
parent: Design
---

# Authentication and Authorization
{: .no_toc }


The {{ site.repo.name }} project caters to both CMS and State users, each requiring specific permissions to ensure secure access and compliance with CMS policies. This page outlines the design and hierarchy of roles within our system, focusing on the allocation of permissions rather than the underlying authentication technology.


## Detail

We have seven distinct user roles within our system, categorized into application roles (app roles) and IDM roles.\
**App Roles** include:

-   **onemac-micro-statesubmitter**
-   **onemac-micro-readonly**
-   **onemac-micro-reviewer**
-   **onemac-micro-helpdesk**

These roles authorize privileges within the OneMAC Micro application. Importantly, a user can be assigned only one of these roles at any given time. These roles are defined within IDM by the user's custom attribute custom:cms-roles and are essential for operational functionality within the application.\
**IDM Roles** consist of:

-   **onemac-micro-sysadmin**
-   **onemac-micro-roleapprover**
-   **onemac-micro-statesysadmin**

IDM roles grant privileges within IDM itself, focusing on role request approvals rather than direct application access. A user can hold one of these roles at any given time, with specific restrictions regarding their combination:

-   Users cannot hold a mix of state and CMS IDM roles. For example, if a user holds the **onemac-micro-statesysadmin** role, they cannot hold a CMS IDM role.
-   Conversely, if a user has a CMS IDM role, they cannot hold the **onemac-micro-statesysadmin** role. However, a user could hold both CMS IDM roles (**onemac-micro-sysadmin** and **onemac-micro-roleapprover**) simultaneously.

**Authentication vs. Authorization:**

-   **Authentication:** Anyone with an active IDM account can log in to the OneMAC Micro application. If they lack one of the four app roles, they will be informed via a banner that they need to request a role through IDM.
-   **Authorization:** Only users with an app role are authorized to perform actions within the application.

Moreover, it is possible for a user to have one app role and one or more IDM roles concurrently. This setup allows for users who manage IDM's administrative tasks to also use the application, provided they have the necessary app role.\
In conclusion, while any IDM account holder can access the OneMAC Micro application, only those with an app role are granted operational privileges. IDM roles serve administrative functions within IDM and have specific combination restrictions to ensure clear role delineation.