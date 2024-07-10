import { ValidationRule } from "react-hook-form";

export const INPUT_VALIDATION_RULES = {
  max: "max",
  min: "min",
  maxLength: "maxLength",
  minLength: "minLength",
  pattern: "pattern",
  required: "required",
  validate: "validate",
} as const;
export type InputValidationRules = typeof INPUT_VALIDATION_RULES;
export type ERROR = Record<string, string>;
export type MaxType =
  | InputValidationRules["max"]
  | InputValidationRules["maxLength"];

export type MinType =
  | InputValidationRules["min"]
  | InputValidationRules["minLength"];

// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = (value: unknown): value is Function =>
  typeof value === "function";

export const isNullOrUndefined = (value: unknown): value is null | undefined =>
  value == null;

export const isUndefined = (val: unknown): val is undefined =>
  val === undefined;

export const isDateObject = (value: unknown): value is Date =>
  value instanceof Date;

export const isObjectType = (value: unknown) => typeof value === "object";

export const isString = (value: unknown): value is string =>
  typeof value === "string";

export const isObject = <T extends object>(value: unknown): value is T =>
  !isNullOrUndefined(value) &&
  !Array.isArray(value) &&
  isObjectType(value) &&
  !isDateObject(value);

export const isRegex = (value: unknown): value is RegExp =>
  value instanceof RegExp;

export const getValueAndMessage = (validationData?: ValidationRule) =>
  isObject(validationData) && !isRegex(validationData)
    ? validationData
    : {
        value: validationData,
        message: "",
      };
