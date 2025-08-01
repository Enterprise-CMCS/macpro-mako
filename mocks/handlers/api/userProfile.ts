import { http, HttpResponse, PathParams } from "msw";
import { canRequestAccess, canUpdateAccess, getApprovingRole } from "shared-utils";

import {
  getFilteredRoleDocsByEmail,
  getFilteredRoleDocsByRole,
  getFilteredRoleDocsByState,
  getFilteredUserDocList,
  getLatestRoleByEmail,
  osUsers,
  roleDocs,
} from "../../data";
import { SubmitRoleRequestBody, TestRoleDocument, UserProfileRequestBody } from "../../index.d";
import { getMockUser } from "../auth.utils";

const defaultApiUserProfileHandler = http.post<PathParams, UserProfileRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getUserProfile",
  async ({ request }) => {
    const authenticatedUser = getMockUser();
    if (!authenticatedUser) {
      return new HttpResponse("User not authenticated", { status: 401 });
    }

    const { userEmail: reqUserEmail } = await request.json();

    const roles = getFilteredRoleDocsByEmail(reqUserEmail || authenticatedUser?.email || "");

    return HttpResponse.json(roles);
  },
);

export const errorApiUserProfileHandler = http.post<PathParams, UserProfileRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getUserProfile",
  async () => {
    return new HttpResponse("Response Error", { status: 500 });
  },
);

const defaultApiGetCreateUserProfileHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/createUserProfile",
  async () => {
    const user = getMockUser();
    if (!user?.email) {
      return new HttpResponse("User not authenticated", { status: 401 });
    }

    const profile = getFilteredUserDocList([user.email || ""]);

    if (profile.length) {
      return HttpResponse.json({ message: "User profile already exists" });
    }
    return HttpResponse.json({ message: "User profile created" });
  },
);

export const errorApiGetCreateUserProfileHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/createUserProfile",
  async () => new HttpResponse("Internal server error", { status: 500 }),
);

const defaultApiGetRoleRequestsHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getRoleRequests",
  async () => {
    const user = getMockUser();
    if (!user) {
      return new HttpResponse("User not authenticated", { status: 401 });
    }

    const profile = getLatestRoleByEmail(user.email || "");

    const role = profile?.[0]?._source?.role;

    if (
      role !== "systemadmin" &&
      role !== "helpdesk" &&
      role !== "cmsroleapprover" &&
      role !== "statesystemadmin"
    ) {
      return new HttpResponse("User not authorized to approve roles", { status: 403 });
    }

    let roles: TestRoleDocument[] = [];
    if (role === "systemadmin" || role === "helpdesk") {
      roles = roleDocs;
    }
    if (role === "cmsroleapprover") {
      roles = roleDocs.filter(
        (roleObj) => !["cmsroleapprover", "systemadmin"].includes(roleObj?.role),
      );
    }
    if (role === "statesystemadmin") {
      roles = getFilteredRoleDocsByState(profile?.[0]?._source.territory || "");
    }

    const rolesWithNames = roles
      // remove the current user from the list
      .filter((roleObj) => roleObj.email !== user.email)
      // add the email and fullName to each role in the list
      .map((roleObj) => {
        const email = roleObj?.id?.split("_")[0];
        const fullName = osUsers[email]?._source?.fullName || "Unknown";

        return {
          ...roleObj,
          email,
          fullName,
        };
      });

    return HttpResponse.json(rolesWithNames);
  },
);

export const errorApiGetRoleRequestsHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getRoleRequests",
  async () => new HttpResponse("Response Error", { status: 500 }),
);

const defaultApiGetSubmitGroupDivisionHandler = http.post<PathParams, UserProfileRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/submitGroupDivision",
  async ({ request }) => {
    const authenticatedUser = getMockUser();
    if (!authenticatedUser) {
      return new HttpResponse("User not authenticated", { status: 401 });
    }

    const { userEmail } = await request.json();

    const email = userEmail || authenticatedUser.email;

    if (!email) {
      return HttpResponse.json({ message: "Email is undefined" }, { status: 500 });
    }

    const user = osUsers[email];

    if (!user) {
      return HttpResponse.json({ message: `User with email ${email} not found.` }, { status: 404 });
    }

    return HttpResponse.json({ message: "Group and division submitted successfully." });
  },
);

const defaultApiOptionSubmitGroupDivisionHandler = http.options(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/submitGroupDivision",
  async () => new HttpResponse(null, { status: 200 }),
);

export const errorApiOptionSubmitGroupDivisionHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/submitGroupDivision",
  async () => new HttpResponse("Response Error", { status: 500 }),
);

const defaultApiSubmitRoleRequestsHandler = http.post<PathParams, SubmitRoleRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/submitRoleRequests",
  async ({ request }) => {
    const user = getMockUser();
    if (!user) {
      return new HttpResponse("User not authenticated", { status: 401 });
    }

    const latestActiveRoleObj = getLatestRoleByEmail(user?.email)?.[0]?._source ?? null;
    if (!latestActiveRoleObj) {
      return new HttpResponse("No active role found for user", { status: 403 });
    }

    const {
      email,
      state,
      role: roleToUpdate,
      eventType,
      grantAccess,
      requestRoleChange,
    } = await request.json();

    let status: string;
    if (!requestRoleChange && canUpdateAccess(latestActiveRoleObj.role, roleToUpdate)) {
      if (grantAccess === true || grantAccess === false) {
        status = grantAccess ? "active" : "denied";
      } else {
        return new HttpResponse("Invalid or missing grantAccess value.", { status: 400 });
      }
    } else if (requestRoleChange && canRequestAccess(latestActiveRoleObj.role)) {
      status = "pending";
    } else {
      return new HttpResponse("You are not authorized to perform this action.", { status: 403 });
    }

    return HttpResponse.json({
      message: `Request to access ${state} has been submitted.`,
      eventType,
      email,
      status,
      territory: state,
      role: roleToUpdate,
      doneByEmail: user.email,
      doneByName: `${user.given_name} ${user.family_name}`,
      date: Date.now(),
    });
  },
);

export const errorApiSubmitRoleRequestsHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/submitRoleRequests",
  async () => new HttpResponse("Response Error", { status: 500 }),
);

const defaultGetApproversHandler = http.post<PathParams, UserProfileRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getApprovers",
  async ({ request }) => {
    const authenticatedUser = getMockUser();
    if (!authenticatedUser) {
      return new HttpResponse("User not authenticated", { status: 401 });
    }

    const { userEmail: reqUserEmail } = await request.json();

    const roles = getFilteredRoleDocsByEmail(reqUserEmail || authenticatedUser?.email || "");

    type ApproverGroup = {
      territory: string;
      email: string;
    };
    const approverGroups: Record<string, Record<string, ApproverGroup[]>> = {};

    for (const roleItem of roles) {
      const originalRole = roleItem.role;
      const approverRole = getApprovingRole(originalRole);
      const approverDocs = getFilteredRoleDocsByRole(approverRole);

      for (const doc of approverDocs) {
        const territory = doc.territory;
        const group = (approverGroups[originalRole] ??= {});
        (group[territory] ??= []).push({
          email: doc.email,
          territory,
        });
      }
    }

    const approverList = Object.entries(approverGroups).flatMap(([originalRole, territoryMap]) =>
      Object.entries(territoryMap).map(([territory, approvers]) => ({
        role: originalRole,
        territory: [territory],
        approvers,
      })),
    );

    return HttpResponse.json({
      message: "Approver List sent successfully.",
      approverList,
    });
  },
);

export const errorApiGetApproversHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getApprovers",
  async () => new HttpResponse("Response Error", { status: 500 }),
);

export const userProfileHandlers = [
  defaultApiUserProfileHandler,
  defaultApiGetCreateUserProfileHandler,
  defaultApiGetRoleRequestsHandler,
  defaultApiGetSubmitGroupDivisionHandler,
  defaultApiOptionSubmitGroupDivisionHandler,
  defaultApiSubmitRoleRequestsHandler,
  defaultGetApproversHandler,
];
