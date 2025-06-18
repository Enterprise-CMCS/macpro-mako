import { http, HttpResponse, PathParams } from "msw";

import { getUserByUsername } from "../../data";
import { getFilteredUserResultList } from "../../data/osusers";
import { getFilteredRoleDocsByEmail, getLatestRoleByEmail } from "../../data/roles";
import { UserDetailsRequestBody } from "../../index.d";
import { getMockUserEmail, getMockUsername } from "../auth.utils";

export const defaultApiUserDetailsHandler = http.post<PathParams, UserDetailsRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getUserDetails",
  async ({ request }) => {
    let email;
    if (Object.hasOwn(request, "body")) {
      try {
        const bodyJSON = await request.json();
        email = bodyJSON?.userEmail;
      } catch (err) {
        console.error(err);
        email = getMockUserEmail();
      }
    } else {
      email = getMockUserEmail();
    }
    console.log({ email });

    if (!email) {
      return HttpResponse.json({});
    }

    const userDetails = getFilteredUserResultList([email || ""])?.[0]?._source ?? null;
    const userRoles = getLatestRoleByEmail(email || "")?.[0]?._source ?? null;

    return HttpResponse.json({
      ...userDetails,
      role: userRoles?.role ?? "norole",
    });
  },
);

export const errorApiUserDetailsHandler = http.post<PathParams, UserDetailsRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getUserDetails",
  () => {
    console.log("throw error");
    return new HttpResponse("Response Error", { status: 500 });
  },
);

const defaultApiRequestBaseCMSAccessHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/requestBaseCMSAccess",
  async () => {
    const username = getMockUsername();
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
