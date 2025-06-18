import { FullUser } from "shared-types";

import { getUserByUsername, makoReviewer, makoStateSubmitter, userResponses } from "../data/users";
import type { TestUserDataWithRole } from "../index.d";

export const getMockUsername = (): string | null => {
  if (typeof window === "undefined") {
    if (process?.env) {
      return process.env.MOCK_USER_USERNAME || null;
    }
  }
  if (window?.localStorage) {
    return window.localStorage.getItem("MOCK_USER_USERNAME");
  }
  return null;
};

export const getMockUserEmail = (): string | null => {
  const username = getMockUsername();
  if (!username) {
    return null;
  }
  const user = getUserByUsername(username);
  if (!user) {
    return null;
  }
  return user?.email;
};

export const setMockUsername = (user?: TestUserDataWithRole | string | null): void => {
  let username;
  if (user && typeof user === "string") {
    username = user;
  } else if (user && (user as TestUserDataWithRole).Username !== undefined) {
    username = (user as TestUserDataWithRole).Username;
  }

  if (typeof window === "undefined") {
    if (process?.env) {
      if (username) {
        process.env.MOCK_USER_USERNAME = username;
      } else {
        delete process.env.MOCK_USER_USERNAME;
      }
    }
  } else if (window?.localStorage) {
    if (username) {
      window.localStorage.setItem("MOCK_USER_USERNAME", username);
    } else {
      window.localStorage.removeItem("MOCK_USER_USERNAME");
    }
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

    return { ...userAttributesObj, role: user.role, states: user.states };
  }

  return {} as FullUser;
};
