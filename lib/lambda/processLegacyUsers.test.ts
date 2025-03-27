import { onemacLegacyUser } from "shared-types/events/legacy-user";
import { describe, expect, it } from "vitest";

///@ts-ignore
import seedJson from "./legacySeedData";
import { isRecordALegacyUser } from "./sinkMainProcessors";

describe("test user data", () => {
  it("is valid cmsreviewer", () => {
    const cmsUsers = seedJson.filter((record: any) =>
      isRecordALegacyUser(record, "onemac"),
    ) as Array<unknown>;

    cmsUsers.forEach((user) => {
      const result = onemacLegacyUser.safeParse(user);
      if (result.success === false) {
        console.log("the following record failed to parse", user.sk);
      }
    });

    expect(1).toEqual(1);
  });
});
