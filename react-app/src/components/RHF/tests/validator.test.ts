import { describe, expect, it } from "vitest";
import { dependencyCheck, documentValidator, validateInput, validateOption } from "../utils";
import { FormSchema } from "shared-types";

describe("Test for RHF validator", () => {
  const rules = { required: true, min: "10", max: "test" };
  it("checks to see if a field is missing while required", () => {
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
  it("checks the document validator", () => {
    const exampleForm: FormSchema = {
      header: "User Registration",
      formId: "userRegForm",
      sections: [
        {
          title: "Personal Information",
          sectionId: "personalInfo",
          form: [
            {
              description: "Please provide your basic details.",
              slots: [
                {
                  name: "firstName",
                  label: "First Name",
                  rhf: "Input",
                  rules: { required: "First Name is required" },
                },
                {
                  name: "lastName",
                  label: "Last Name",
                  rhf: "Input",
                },
                {
                  rhf: "Checkbox",
                  name: "assurance-method-in-plan",
                  rules: { required: "* Required" },
                  props: {
                    options: [
                      {
                        label:
                          "The state or territory provides assurance that, for each benefit provided under an Alternative Benefit Plan that is not provided through managed care, it will use the payment methodology in its approved state plan or hereby submits state plan amendment Attachment 4.19a, 4.19b, or 4.19d, as appropriate, describing the payment methodology for the benefit.",
                        value: "assures_alternative_benefit_plan_in_accordance",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          title: "Preferences",
          sectionId: "preferences",
          dependency: {
            conditions: [{ name: "acceptTerms", type: "valueExists" }],
            effect: { type: "show" },
          },
          form: [
            {
              description: "Set your preferences.",
              slots: [
                {
                  name: "notifications",
                  label: "Enable Notifications",
                  rhf: "Switch",
                },
              ],
            },
          ],
        },
        {
          title: "other",
          sectionId: "other",
          dependency: {
            conditions: [{ name: "acceptTerms", type: "valueExists" }],
            effect: { type: "hide" },
          },
          form: [
            {
              description: "Set your preferences.",
              slots: [
                {
                  name: "notifications",
                  label: "Enable Notifications",
                  rhf: "Textarea",
                },
              ],
            },
          ],
        },
      ],
    };
    const validator = documentValidator(exampleForm);

    const goodData = {
      firstName: "Thomas",
      lastName: "Walker",
      "assurance-method-in-plan": ["assures_alternative_benefit_plan_in_accordance"],
    };
    expect(validator(goodData)).toStrictEqual({ firstName: "", lastName: "", notifications: "" });
    let badDataName = { firstame: "Thomas" };
    expect(validator(badDataName)).toStrictEqual({
      firstName: "First Name is required",
      lastName: "",
      notifications: "",
    });
    const badDataCheck = {
      firstName: "Thomas",
      lastName: "Walker",
      "assurance-method-in-plan": ["bad value"],
    };
    expect(validator(badDataCheck)).toStrictEqual({
      "assurance-method-in-plan": "invalid option - 'bad value'",
      firstName: "",
      lastName: "",
      notifications: "",
    });
  });
});
