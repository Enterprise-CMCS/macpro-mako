import { describe, it, expect } from "vitest";
import { getAvailableActions } from "../package-actions/getAvailableActions";
import { testCMSCognitoUser, testItemResult } from "./testData";
import { opensearch } from "shared-types";

describe("getAvailableActions", () => {
  it("delivers an array of actions for a package", () => {
    const result = getAvailableActions(
      testCMSCognitoUser.user,
      testItemResult._source,
    );
    expect(result).toEqual(["issue-rai", "complete-intake"]);
  });
  it("delivers an array of common actions shared by a parent and child (AppK logic)", () => {
    const parent: opensearch.main.Document = {
      ...testItemResult._source,
      appkParent: true as undefined, // Why? We need to fix opensearch.main.Document typing.
      raiWithdrawEnabled: true, // Will not be an available action despite this because child doesn't have the same attribute
      appkChildren: [testItemResult],
    };
    const result = getAvailableActions(testCMSCognitoUser.user, parent);
    expect(result).toEqual(["issue-rai", "complete-intake"]);
  });
});
