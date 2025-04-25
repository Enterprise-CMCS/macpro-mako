import { FullUser } from "shared-types";

import { makoReviewer, makoStateSubmitter, userResponses } from "../data/users";
import type { TestUserDataWithRole } from "../index.d";

export const setMockUsername = (user?: TestUserDataWithRole | string | null): void => {
  if (user && typeof user === "string") {
    process.env.MOCK_USER_USERNAME = user;
  } else if (user && (user as TestUserDataWithRole).Username !== undefined) {
    process.env.MOCK_USER_USERNAME = (user as TestUserDataWithRole).Username;
  } else {
    delete process.env.MOCK_USER_USERNAME;
  }
};

export const setDefaultStateSubmitter = () => setMockUsername(makoStateSubmitter);

export const setDefaultReviewer = () => setMockUsername(makoReviewer);

export const findUserByUsername = (username: string): TestUserDataWithRole | undefined =>
  userResponses.find((user) => user.Username == username);

export const convertUserAttributes = (user: TestUserDataWithRole): FullUser => {
  if (user?.UserAttributes) {
    const userAttributesObj = user.UserAttributes.reduce(
      (obj, item) =>
        item?.Name && item?.Value
          ? {
              ...obj,
              [item.Name]: item.Value,
            }
          : obj,
      {} as FullUser,
    );
    // Manual additions and normalizations
    userAttributesObj["custom:cms-roles"] = userAttributesObj["custom:cms-roles"] || "";

    userAttributesObj.username = user.Username || "";

    return { ...userAttributesObj, role: user.role };
  }

  return {} as FullUser;
};
