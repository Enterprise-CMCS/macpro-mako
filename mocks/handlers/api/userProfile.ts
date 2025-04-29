import { http, HttpResponse } from "msw";

import { TestRoleDocument } from "../..";
import {
  getFilteredRoleDocsByEmail,
  getFilteredRoleDocsByState,
  getFilteredUserDocList,
  getLatestRoleByEmail,
  getUserByUsername,
  osUsers,
  roleDocs,
} from "../../data";

const defaultApiUserProfileHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getUserProfile",
  async () => {
    const username = process.env.MOCK_USER_USERNAME;
    if (!username) {
      return HttpResponse.json([]);
    }
    const user = getUserByUsername(username);
    if (!user) {
      return HttpResponse.json([]);
    }
    const roles = getFilteredRoleDocsByEmail(user?.email || "");

    return HttpResponse.json(roles);
  },
);

const defaultApiGetCreateUserProfileHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/createUserProfile",
  async () => {
    const username = process.env.MOCK_USER_USERNAME;
    if (!username) {
      return HttpResponse.json([]);
    }
    const user = getUserByUsername(username);
    if (!user) {
      return HttpResponse.json([]);
    }
    const profile = getFilteredUserDocList([user?.email || ""]);

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
    const username = process.env.MOCK_USER_USERNAME;
    if (!username) {
      return new HttpResponse("User not authenticated", { status: 401 });
    }
    const user = getUserByUsername(username);
    if (!user) {
      return new HttpResponse("User not authenticated", { status: 401 });
    }

    const profile = getLatestRoleByEmail(user?.email || "");

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

    roles = roles.filter((roleObj) => roleObj.email !== user.email);
    const rolesWithNames = roles.map((roleObj) => {
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

export const userProfileHandlers = [
  defaultApiUserProfileHandler,
  defaultApiGetCreateUserProfileHandler,
  defaultApiGetRoleRequestsHandler,
];
