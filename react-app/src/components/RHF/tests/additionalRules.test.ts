import { describe, expect, it } from "vitest";
import {
  ruleGenerator,
  sortFunctions,
  sortOptionsLowestToHighest,
  stringCompare,
} from "../utils/additionalRules";

type VO = Record<string, any>;

describe("Additional Rules Tests", () => {
  describe("Sort Function Tests", () => {
    const dataArray = ["Florida, Ohio, Washington, Maine"];
    it("no sort", () => {
      const testArr = [...dataArray].sort(sortFunctions.noSort);
      expect(testArr.toString()).toBe(dataArray.toString());
      const result = sortFunctions.noSort("a", "b");
      expect(result).toBe(0);
    });
    it("reverse sort", () => {
      const testArr = [...dataArray].sort(sortFunctions.reverseSort);
      const compareArr = [...dataArray].sort().reverse();
      expect(compareArr.toString()).toBe(testArr.toString());
      const result = sortFunctions.reverseSort("b", "a");
      expect(result).toBe(-1);
    });
  });
  describe("Test items lowest to highest", () => {
    it("Sort from lowest to highest", () => {
      const testData = [{ value: 3 }, { value: 1 }, { value: 2 }];
      const result = sortOptionsLowestToHighest(testData);
      const expected = [
        {
          value: 1,
        },
        {
          value: 2,
        },
        {
          value: 3,
        },
      ];
      expect(result).toStrictEqual(expected);
    });
  });
  describe("String compare tests", () => {
    it("Compares two strings to eachother", () => {
      const match = stringCompare({ label: "A" }, { label: "A" });
      expect(match).toBe(0);
      const misMatchOrder = stringCompare({ label: "A" }, { label: "B" });
      expect(misMatchOrder).toBe(-1);
      const misMatchReverseORder = stringCompare({ label: "B" }, { label: "A" });
      expect(misMatchReverseORder).toBe(1);
    });
    it("Compares two number strings to eachother", () => {
      const match = stringCompare({ label: "1" }, { label: "1" });
      expect(match).toBe(0);
      const misMatchOrder = stringCompare({ label: "1" }, { label: "2" });
      expect(misMatchOrder).toBe(-1);
      const misMatchReverseORder = stringCompare({ label: "3" }, { label: "2" });
      expect(misMatchReverseORder).toBe(1);
    });
  });
  describe("Custom Validation Tests", () => {
    const testData = {
      testCompField1: "0",
      testCompField2: "10",
      testCompField3: undefined,
    };

    it("Less than field", () => {
      const rules = ruleGenerator(undefined, [
        {
          fieldName: "testCompField1",
          type: "lessThanField",
          message: "Validation Failed 1",
        },
        {
          fieldName: "testCompField1",
          type: "lessThanField",
          message: "Validation Failed 2",
          strictGreater: true,
        },
      ]);

      if (!rules) throw new Error("Failed to create rule set.");

      const valFunc1 = (rules.validate as VO)["lessThanField_0"];
      expect(valFunc1).toBeTruthy();
      expect(valFunc1(0, testData)).toBeTruthy();
      expect(valFunc1(10, testData)).toBeTruthy();
      expect(valFunc1(100, testData)).toBe("Validation Failed 1");

      const valFunc2 = (rules.validate as VO)["lessThanField_1"];
      expect(valFunc2).toBeTruthy();
      expect(valFunc2(0, testData)).toBeTruthy();
      expect(valFunc2(10, testData)).toBe("Validation Failed 2");
      expect(valFunc2(100, testData)).toBe("Validation Failed 2");
    });

    it("Greater than field", () => {
      const rules = ruleGenerator(undefined, [
        {
          fieldName: "testCompField2",
          type: "greaterThanField",
          message: "Validation Failed 1",
        },
        {
          fieldName: "testCompField2",
          type: "greaterThanField",
          message: "Validation Failed 2",
          strictGreater: true,
        },
      ]);

      if (!rules) throw new Error("Failed to create rule set.");

      const valFunc1 = (rules.validate as VO)["greaterThanField_0"];
      expect(valFunc1).toBeTruthy();
      expect(valFunc1(0, testData)).toBeTruthy();
      expect(valFunc1(10, testData)).toBeTruthy();
      expect(valFunc1(100, testData)).toBeTruthy();
      expect(valFunc1(-1, testData)).toBe("Validation Failed 1");

      const valFunc2 = (rules.validate as VO)["greaterThanField_1"];
      expect(valFunc2).toBeTruthy();
      expect(valFunc2(10, testData)).toBeTruthy();
      expect(valFunc2(100, testData)).toBeTruthy();
      expect(valFunc2(0, testData)).toBe("Validation Failed 2");
      expect(valFunc2(-1, testData)).toBe("Validation Failed 2");
    });

    it("Cannot coexist", () => {
      const rules = ruleGenerator(undefined, [
        {
          fieldName: "testCompField1",
          type: "cannotCoexist",
          message: "Validation Failed 1",
        },
        {
          fieldName: "testCompField3",
          type: "cannotCoexist",
          message: "Validation Failed 2",
        },
      ]);

      if (!rules) throw new Error("Failed to create rule set.");

      const valFunc1 = (rules.validate as VO)["cannotCoexist_0"];
      expect(valFunc1).toBeTruthy();
      expect(valFunc1(undefined, testData)).toBeTruthy();
      expect(valFunc1("test", testData)).toBe("Validation Failed 1");

      const valFunc2 = (rules.validate as VO)["cannotCoexist_1"];
      expect(valFunc2).toBeTruthy();
      expect(valFunc2(undefined, testData)).toBeTruthy();
      expect(valFunc2("test", testData)).toBeTruthy();
    });

    it("No gaps or overlaps", () => {
      const rules = ruleGenerator(undefined, [
        {
          type: "noGapsOrOverlaps",
          fieldName: "testField",
          fromField: "from",
          toField: "to",
          options: [
            { value: "1", label: "Option 1" },
            { value: "2", label: "Option 2" },
          ],
        },
      ]);

      if (!rules) throw new Error("Failed to create rule set.");

      const valFunc = (rules.validate as VO)["noGapsOrOverlaps_0"];
      expect(valFunc).toBeTruthy();

      // Test case: no gaps or overlaps
      const noGapsOrOverlapsData = {
        testField: [
          { from: 1, to: 3 },
          { from: 3, to: 5 },
          { from: 5, to: 7 },
        ],
      };
      expect(valFunc("test", noGapsOrOverlapsData.testField)).toBe(true);
      expect(valFunc("test", noGapsOrOverlapsData)).toBe(true);
      // Test case: gap between 3 and 5
      const gapData = {
        testField: [
          { from: 1, to: 3 },
          { from: 5, to: 7 },
        ],
      };
      expect(valFunc("test", gapData)).toBe("No gaps between ages allowed");

      // Test case: overlap between 3 and 5
      const overlapData = {
        testField: [
          { from: 1, to: 4 },
          { from: 3, to: 6 },
        ],
      };
      expect(valFunc("test", overlapData)).toBe("No age overlaps allowed");
    });
  });
  it("to Greater than from", () => {
    const rules = ruleGenerator(undefined, [
      {
        type: "toGreaterThanFrom",
        fieldName: "testField",
        fromField: "from",
        toField: "to",
        message: "failure",
      },
    ]);
    const valFunc = (rules.validate as VO)["toGreaterThanFrom_0"];
    // Empty Field
    const missingData = { testField: [] };
    expect(valFunc(1, missingData)).toBe(true);
    // Not an array for field
    const notArray = { testField: "not array" };
    expect(valFunc(1, notArray)).toBe(true);

    const notCurrentIndex = { testField: [{ from: 6, to: 30 }] };
    expect(valFunc(1, notCurrentIndex)).toBe(true);
    const toNotANumber = {
      testField: [{ from: 1, to: "blah" }],
    };
    expect(valFunc(1, toNotANumber)).toBe(true);
    const goodScenario = {
      testField: [{ from: 1, to: 4 }],
    };
    expect(valFunc(1, goodScenario)).toBe(true);
    const badScenario = {
      testField: [{ from: 1, to: 1 }],
    };
    expect(valFunc(1, badScenario)).toBe("failure");
  });
});
