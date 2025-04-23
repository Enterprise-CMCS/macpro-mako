import { http, HttpResponse } from "msw";

import { getUserByUsername } from "../../data";
import { getFilteredUserDocList } from "../../data/osusers";

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
    const details = getFilteredUserDocList([user?.email || ""]);

    return HttpResponse.json(details);
  },
);

export const userDetailsHandlers = [defaultApiUserDetailsHandler];
