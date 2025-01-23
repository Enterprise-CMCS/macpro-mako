import { describe, expect, it } from "vitest";
import { documentValidator, validateInput, validateOption } from "../utils";
import { mockForms } from "mocks/data/forms/main";

describe("Test for RHF validator", () => {
  it("checks to see if a field is missing while required", () => {
    const rules = { required: true, min: "10", max: "test" };
    let missingRequired = validateInput(undefined, rules);
    expect(missingRequired).toBe("*Required");
    missingRequired = validateInput("", rules);
    expect(missingRequired).toBe("*Required");
    missingRequired = validateInput([], rules);
    expect(missingRequired).toBe("*Required");
  });
  it("checks to see if a number is within the limits", () => {
    const rules = {
      required: true,
      min: { value: "5", message: "too short" },
      max: { value: "10", message: "too long" },
    };
    const valid = validateInput("6", rules);
    expect(valid).toBe("");
    const tooShort = validateInput("4", rules);
    expect(tooShort).toBe("too short");
    const tooLong = validateInput("20", rules);
    expect(tooLong).toBe("too long");
  });
  it("checks to see if a date is within the limits", () => {
    const past = new Date(2023, 11, 25).toISOString();
    const future = new Date(2025, 11, 25).toISOString();
    const rules = {
      required: true,
      min: { value: past, message: "too far back" },
      max: { value: future, message: "too far in the future" },
    };
    const valid = validateInput("12/25/2024", rules);
    expect(valid).toBe("");
    const tooShort = validateInput("12/25/2020", rules);
    expect(tooShort).toBe("too far back");
    const tooLong = validateInput("12/25,2027", rules);
    expect(tooLong).toBe("too far in the future");
  });
  it("checks to see if a string is within the limits", () => {
    const rules = {
      maxLength: { value: 10, message: "too long" },
      minLength: { value: 5, message: "too short" },
    };
    const valid = validateInput("ABCDEF", rules);
    expect(valid).toBe("");
    const tooShort = validateInput("ABC", rules);
    expect(tooShort).toBe("too short");
    const tooLong = validateInput("ABCDEFGHIJK", rules);
    expect(tooLong).toBe("too long");
  });
  it("checks the regex pattern", () => {
    const patternValue = /^t.st value$/;
    const rules = {
      required: true,
      pattern: {
        value: patternValue,
        message: "Does not match",
      },
    };
    const valid = validateInput("test value", rules);
    expect(valid).toBe("");
    const notMatch = validateInput("no matching", rules);
    expect(notMatch).toBe("Does not match");
  });
  it("checks validate options", () => {
    const options = [{ value: "1" }, { value: "2" }];

    const match = validateOption("1", options);
    expect(match).toStrictEqual({ value: "1" });
    const misMatch = validateOption("3", options);
    expect(misMatch).toBeUndefined();
  });
  it("checks the document validator for a text slot", () => {
    const validator = documentValidator(mockForms.textForm);
    const badData = {
      firstName: "",
    };
    expect(validator(badData)).toStrictEqual({
      firstName: "First Name is required",
    });
    const goodData = {
      firstName: "Thomas",
    };
    expect(validator(goodData)).toStrictEqual({
      firstName: "",
    });
  });
  it("checks the document validator for a input box", () => {
    const validator = documentValidator(mockForms.inputForm);
    const goodData = {
      testNameInput: "",
    };
    expect(validator(goodData)).toStrictEqual({
      testNameInput: "",
    });
  });
  it("checks the document validator for a select box", () => {
    const validator = documentValidator(mockForms.selectForm);
    const goodData = {
      test_select: "yes",
    };
    expect(validator(goodData)).toStrictEqual({});
    const bad = {
      not_a_field: "not a answer",
    };
    expect(validator(bad)).toStrictEqual({ test_select: "invalid option - 'undefined'" });
  });
  it("checks the document validator for a check box", () => {
    const validator = documentValidator(mockForms.checkboxForm);
    const badData = {
      test_checkbox: ["yes", "no"],
    };
    expect(validator(badData)).toStrictEqual({ test_checkbox: "invalid option - 'yes,no'" });

    const goodData = {
      test_checkbox: ["test-value"],
    };
    expect(validator(goodData)).toStrictEqual({});
  });
  it("checks the document validator for a check box", () => {
    const validator = documentValidator(mockForms.radioForm);
    const badData = {
      test_radio: 3,
    };
    expect(validator(badData)).toStrictEqual({ test_radio: "invalid option - '3'" });

    const goodData = {
      test_radio: "1",
    };
    expect(validator(goodData)).toStrictEqual({});
  });
  it("checks the document validator for a select box", () => {
    const validator = documentValidator(mockForms.selectForm);
    const badData = {
      test_select: 3,
    };
    expect(validator(badData)).toStrictEqual({ test_select: "invalid option - '3'" });

    const goodData = {
      test_select: "yes",
    };
    expect(validator(goodData)).toStrictEqual({});
  });
  it("checks the document validator for a switch box", () => {
    const validator = documentValidator(mockForms.switchForm);

    const goodData = {
      notifications: "yes",
    };
    expect(validator(goodData)).toStrictEqual({ notifications: "" });
  });
});
