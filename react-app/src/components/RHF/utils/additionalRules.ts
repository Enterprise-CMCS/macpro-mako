import { RegisterOptions } from "react-hook-form";
import { RuleGenerator, SortFuncs, AdditionalRule } from "shared-types";

export const sortFunctions: {
  [x in SortFuncs]: (a: string, b: string) => number;
} = {
  noSort: () => 0,
  reverseSort: (a, b) => b.localeCompare(a),
};

// New function to sort options from lowest to highest
export function sortOptionsLowestToHighest<
  T extends { value: string | number },
>(options: T[]): T[] {
  return [...options].sort((a, b) => {
    const aValue = typeof a.value === "string" ? parseFloat(a.value) : a.value;
    const bValue = typeof b.value === "string" ? parseFloat(b.value) : b.value;
    return aValue - bValue;
  });
}

export function stringCompare(
  a: { label: string },
  b: { label: string },
): number {
  const aIsNumber = !isNaN(parseFloat(a.label));
  const bIsNumber = !isNaN(parseFloat(b.label));

  if (aIsNumber && bIsNumber) {
    return parseFloat(a.label) - parseFloat(b.label);
  } else {
    return a.label.localeCompare(b.label);
  }
}

export const ruleGenerator: RuleGenerator = (rules, addtnlRules) => {
  if (!rules && !addtnlRules) return undefined;
  const simpleRules = rules ?? {};
  const customRules = addtnlRules
    ? { validate: addtnlRules.reduce(valReducer, {}) }
    : {};

  return { ...simpleRules, ...customRules };
};

export const valReducer = (
  valSet: RegisterOptions["validate"],
  rule: AdditionalRule,
  index: number,
): RegisterOptions["validate"] => {
  const valName = `${rule.type}_${index}`;

  switch (rule.type) {
    case "lessThanField":
      return {
        ...valSet,
        [valName]: (value, fields) => {
          if (
            !rule.strictGreater &&
            parseFloat(value) <= parseFloat(fields[rule.fieldName])
          )
            return true;
          else if (parseFloat(value) < parseFloat(fields[rule.fieldName]))
            return true;
          return rule.message;
        },
      };
    case "greaterThanField":
      return {
        ...valSet,
        [valName]: (value, fields) => {
          if (
            !rule.strictGreater &&
            parseFloat(value) >= parseFloat(fields[rule.fieldName])
          )
            return true;
          else if (parseFloat(value) > parseFloat(fields[rule.fieldName]))
            return true;
          return rule.message;
        },
      };
    case "cannotCoexist":
      return {
        ...valSet,
        [valName]: (value, fields) => {
          if (value !== undefined && fields[rule.fieldName] === undefined)
            return true;
          if (value === undefined && fields[rule.fieldName] !== undefined)
            return true;
          return rule.message;
        },
      };
    case "noGapsOrOverlapsInSelectOptions":
      return {
        ...valSet,
        [valName]: (_, fields) => {
          const fieldArray = fields[rule.fieldName];
          if (!fieldArray || !Array.isArray(fieldArray)) {
            return true;
          }

          const fromField = rule.fromField;
          const toField = rule.toField;

          const range = fieldArray.map((item: any) => ({
            from: parseInt(item[fromField], 10),
            to: parseInt(item[toField], 10),
          }));

          range.sort((a, b) => a.from - b.from);
          const sortedOptions = sortOptionsLowestToHighest(rule.options);

          const minValue = parseInt(sortedOptions[0]?.value, 10);
          const maxValue = parseInt(
            sortedOptions[sortedOptions.length - 1]?.value,
            10,
          );

          // Check for gaps and overlaps
          for (let i = 0; i < range.length; i++) {
            if (i === 0 && range[i].from !== minValue) {
              return rule.message; // Gap at the beginning
            }
            if (i > 0) {
              if (range[i].from > range[i - 1].to + 1) {
                return rule.message; // Gap between ranges
              }
              if (range[i].from <= range[i - 1].to) {
                return rule.message; // Overlaping age ranges
              }
            }
          }

          // Check if the last range ends at the maximum value
          if (range[range.length - 1].to !== maxValue) {
            return rule.message; // Gap at the end
          }

          return true; // No gaps or overlaps found
        },
      };
    default:
      return { ...valSet };
  }
};
