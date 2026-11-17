import { describe, expect, it } from "vitest";

import { CE_TIMESTAMP, ceSubsequentInput } from "../../../events/ce-test-fixtures";
import { transform } from "./ce-subsequent-documents";

describe("ce-subsequent-documents main transform", () => {
  it("updates the change timestamp without replacing package status", () => {
    const result = transform().parse(ceSubsequentInput());

    expect(result).toEqual({
      id: "MD-CE-26-001",
      makoChangedDate: new Date(CE_TIMESTAMP).toISOString(),
    });
    expect(result).not.toHaveProperty("seatoolStatus");
    expect(result).not.toHaveProperty("additionalInformation");
    expect(result).not.toHaveProperty("hardshipKind");
  });
});
