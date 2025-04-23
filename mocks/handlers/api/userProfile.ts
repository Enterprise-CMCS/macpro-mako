import { http, HttpResponse } from "msw";

import { getUserByUsername } from "../../data";
import { getFilteredRolesByEmail } from "../../data/roles";

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
    const roles = getFilteredRolesByEmail(user?.email || "");

    return HttpResponse.json(roles);
  },
);

export const userProfileHandlers = [defaultApiUserProfileHandler];
