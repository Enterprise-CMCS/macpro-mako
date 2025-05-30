import {
  onemacLegacyUserInformation,
  onemacLegacyUserRoleRequest,
} from "shared-types/events/legacy-user";
import { describe, it } from "vitest";

import { isRecordALegacyUser, isRecordALegacyUserRoleRequest } from "../sinkMainProcessors";
///@ts-ignore
import seedJson from "./legacySeedData";

describe("test user data", () => {
  it("is valid cmsreviewer", () => {
    const cmsUserRoleRequests = seedJson.filter((record: any) =>
      isRecordALegacyUserRoleRequest(record, "onemac"),
    ) as Array<unknown>;
    const cmsUsers = seedJson.filter((record: any) => isRecordALegacyUser(record, "onemac"));

    cmsUserRoleRequests.forEach((user) => {
      const result = onemacLegacyUserRoleRequest.safeParse(user);
      if (result.success === false) {
        ///@ts-ignore
        console.log("the following record failed to parse", user.sk);
        console.log("validation error: ", result.error); // remove
        throw new Error("failed to validate user role information");
      }
    });

    cmsUsers.forEach((user: any) => {
      const result = onemacLegacyUserInformation.safeParse(user);
      if (result.success === false) {
        console.log("the following record failed to parse", user.sk, result.error);

        throw new Error("failed to validate user information");
      }
    });
  });
});
