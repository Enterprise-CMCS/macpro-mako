import { http, HttpResponse } from "msw";

import { getUserByUsername } from "../../data";
import { getFilteredUserResultList } from "../../data/osusers";
import { getLatestRoleByEmail } from "../../data/roles";

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

export const userDetailsHandlers = [defaultApiUserDetailsHandler];
