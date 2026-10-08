import { describe, expect, it } from "vitest";

import { mergeProducerAccounts } from "../../scripts/bootstrap-bigmac-error-queue";

describe("mergeProducerAccounts", () => {
  it("adds OneMAC while preserving existing producer accounts", () => {
    expect(
      mergeProducerAccounts(
        {
          bigmac: "111111111111",
          seatool: "222222222222",
        },
        "333333333333",
      ),
    ).toEqual({
      bigmac: "111111111111",
      seatool: "222222222222",
      onemac: "333333333333",
    });
  });

  it("updates only the OneMAC account when it already exists", () => {
    expect(
      mergeProducerAccounts(
        {
          bigmac: "111111111111",
          onemac: "222222222222",
        },
        "333333333333",
      ),
    ).toEqual({
      bigmac: "111111111111",
      onemac: "333333333333",
    });
  });
});
