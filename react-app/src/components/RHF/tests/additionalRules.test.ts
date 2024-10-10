import { describe, test, expect } from "vitest";
import { sortFunctions, ruleGenerator } from "../utils/additionalRules";

type VO = Record<string, any>;

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

  describe("Custom Validation Tests", () => {
    const testData = {
      testCompField1: "0",
      testCompField2: "10",
      testCompField3: undefined,
    };

    test("Less than field", () => {
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

    test("Greater than field", () => {
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

    test("Cannot coexist", () => {
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

    test("No gaps or overlaps", () => {
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
      expect(valFunc(undefined, noGapsOrOverlapsData.testField)).toBeTruthy();

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
});
