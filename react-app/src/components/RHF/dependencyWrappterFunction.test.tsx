import { describe, expect, it } from "vitest";
import { checkTriggeringValue } from "./dependencyWrapper";
import { DependencyRule } from "shared-types";
describe("Trigger Check Switch test", () => {
  it("Test if the expected value is correct", () => {
    const dependency: DependencyRule = {
      conditions: [{ type: "expectedValue", expectedValue: "test", name: "field1" }],
      effect: { type: "show" },
      looseConditions: false,
    };
    let trigger = checkTriggeringValue(["tes"], dependency);
    expect(trigger).toBeFalsy();
    trigger = checkTriggeringValue([["test", "tes"]], dependency);
    expect(trigger).toBe(true);
  });
  it("Test if the notbadvalue is correct", () => {
    const dependency: DependencyRule = {
      conditions: [{ type: "notBadValue", expectedValue: "test", name: "field1" }],
      effect: { type: "show" },
      looseConditions: false,
    };
    let trigger = checkTriggeringValue(["tes"], dependency);
    expect(trigger).toBe(true);
    trigger = checkTriggeringValue(["test"], dependency);
    expect(trigger).toBeFalsy();
    trigger = checkTriggeringValue([["tes", "tes"]], dependency);
    expect(trigger).toBe(true);
  });
  it("Test if the notOnlyBadValue is correct", () => {
    const dependency: DependencyRule = {
      conditions: [{ type: "notOnlyBadValue", expectedValue: "test", name: "field1" }],
      effect: { type: "show" },
      looseConditions: false,
    };
    let trigger = checkTriggeringValue(["tes"], dependency);
    expect(trigger).toBe(true);
    trigger = checkTriggeringValue(["test"], dependency);
    expect(trigger).toBeFalsy();
    trigger = checkTriggeringValue([["tes"]], dependency);
    expect(trigger).toBe(true);
  });
  it("Test if the valueExists is correct", () => {
    const dependency: DependencyRule = {
      conditions: [{ type: "valueExists", name: "field1" }],
      effect: { type: "show" },
      looseConditions: false,
    };
    let trigger = checkTriggeringValue(["tes"], dependency);
    expect(trigger).toBe(true);
    trigger = checkTriggeringValue([], dependency);
    expect(trigger).toBeFalsy();
    trigger = checkTriggeringValue([["tes"]], dependency);
    expect(trigger).toBe(true);
    trigger = checkTriggeringValue([[]], dependency);
    expect(trigger).toBeFalsy();
  });
  it("Test if the valueNotExist is correct", () => {
    const dependency: DependencyRule = {
      conditions: [{ type: "valueNotExist", name: "field1" }],
      effect: { type: "show" },
      looseConditions: false,
    };
    let trigger = checkTriggeringValue(["tes"], dependency);
    expect(trigger).toBeFalsy();
    trigger = checkTriggeringValue([], dependency);
    expect(trigger).toBe(true);
    trigger = checkTriggeringValue([["tes"]], dependency);
    expect(trigger).toBeFalsy();
    trigger = checkTriggeringValue([[]], dependency);
    expect(trigger).toBe(true);
  });
});
