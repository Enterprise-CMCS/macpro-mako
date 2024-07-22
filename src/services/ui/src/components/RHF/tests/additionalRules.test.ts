import { describe, test, expect } from "vitest";
import { sortFunctions } from "../utils/additionalRules";

describe("Additional Rules Tests", () => {
  describe("Sort Function Tests", () => {
    const dataArray = ["Florida, Ohio, Washington, Maine"];

    test("no sort", () => {
      const testArr = [...dataArray].sort(sortFunctions.noSort);
      expect(testArr.toString()).toBe(dataArray.toString());
    });

    test("reverse sort", () => {
      const testArr = [...dataArray].sort(sortFunctions.reverseSort);
      const compareArr = [...dataArray].sort().reverse();

      expect(compareArr.toString()).toBe(testArr.toString());
    });
  });
});
