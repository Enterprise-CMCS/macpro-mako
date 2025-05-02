import { http, HttpResponse } from "msw";

import { getUserByUsername } from "../../data";
import { getFilteredUserResultList } from "../../data/osusers";
import { getFilteredRoleDocsByEmail, getLatestRoleByEmail } from "../../data/roles";

const defaultApiUserDetailsHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getUserDetails",
  async () => {
    const username = process.env.MOCK_USER_USERNAME;
    if (!username) {
      return HttpResponse.json({});
    }
    const user = getUserByUsername(username);
    if (!user) {
      return HttpResponse.json({});
    }
    const userDetails = getFilteredUserResultList([user?.email || ""])?.[0]?._source ?? null;
    const userRoles = getLatestRoleByEmail(user?.email || "")?.[0]?._source ?? null;

    return HttpResponse.json({
      ...userDetails,
      role: userRoles?.role ?? "",
    });
  },
);

const defaultApiRequestBaseCMSAccessHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/requestBaseCMSAccess",
  async () => {
    const username = process.env.MOCK_USER_USERNAME;
    if (!username) {
      return new HttpResponse("User not authenticated", { status: 401 });
    }
    const user = getUserByUsername(username);
    if (!user) {
      return new HttpResponse("User not authenticated", { status: 401 });
    }

    const userRoles = getFilteredRoleDocsByEmail(user?.email || "");

    if (userRoles.length) {
      return HttpResponse.json({ message: "User roles already created" });
    }

    if (user["custom:ismemberof"]) {
      return HttpResponse.json({ message: "User role updated, because no default role found" });
    }

    if (user["custom:cms-roles"].includes("onemac-helpdesk")) {
      return HttpResponse.json({ message: "User role updated, because no default role found" });
    }

    return HttpResponse.json({ message: "User role not updated" });
  },
);

export const errorApiRequestBaseCMSAccessHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/requestBaseCMSAccess",
  async () => new HttpResponse("Internal server error", { status: 500 }),
);

export const userDetailsHandlers = [
  defaultApiUserDetailsHandler,
  defaultApiRequestBaseCMSAccessHandler,
];
