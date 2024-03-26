import { it, describe, expect } from "vitest";
import { convertRegexToString, reInsertRegex } from "../regex";

const testRegex = /^-?\d*\.?\d+$/g;

const testForm = {
  label: "SSI federal benefit amount",
  value: "ssi_federal_benefit_amount",
  slots: [
    {
      rhf: "Input",
      name: "ssi_federal_benefit_percentage",
      label: "Enter the SSI Federal Benefit Rate percentage",
      props: {
        icon: "%",
      },
      rules: {
        pattern: {
          value: testRegex,
          message: "Must be a percentage",
        },
        required: "* Required",
      },
    },
  ],
};

describe("form regex", () => {
  it("conversion logic should work", () => {
    const result = convertRegexToString(testForm);
    const val = result.slots[0].rules.pattern.value;

    const jsonVal = JSON.stringify(val);
    expect(jsonVal).toBeTypeOf("string");

    const parsedVal = JSON.parse(jsonVal);

    const restoredRegex = new RegExp(parsedVal[1], parsedVal[2]);
    expect(restoredRegex).toEqual(testRegex);
    expect(reInsertRegex(result)).toEqual(testForm);
  });
});
