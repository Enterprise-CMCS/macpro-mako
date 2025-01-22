import { RegisterOptions } from "react-hook-form";
import { RuleGenerator, SortFuncs, AdditionalRule } from "shared-types/forms";

export const sortFunctions: {
  [x in SortFuncs]: (a: string, b: string) => number;
} = {
  noSort: () => 0,
  reverseSort: (a, b) => b.localeCompare(a),
};

// New function to sort options from lowest to highest
export function sortOptionsLowestToHighest<T extends { value: string | number }>(
  options: T[],
): T[] {
  return [...options].sort((a, b) => {
    const aValue = typeof a.value === "string" ? parseFloat(a.value) : a.value;
    const bValue = typeof b.value === "string" ? parseFloat(b.value) : b.value;
    return aValue - bValue;
  });
}

export function stringCompare(a: { label: string }, b: { label: string }): number {
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
  const customRules = addtnlRules ? { validate: addtnlRules.reduce(valReducer, {}) } : {};

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
          if (!rule.strictGreater && parseFloat(value) <= parseFloat(fields[rule.fieldName]))
            return true;
          else if (parseFloat(value) < parseFloat(fields[rule.fieldName])) return true;
          return rule.message;
        },
      };
    case "greaterThanField":
      return {
        ...valSet,
        [valName]: (value, fields) => {
          if (!rule.strictGreater && parseFloat(value) >= parseFloat(fields[rule.fieldName]))
            return true;
          else if (parseFloat(value) > parseFloat(fields[rule.fieldName])) return true;
          return rule.message;
        },
      };
    case "cannotCoexist":
      return {
        ...valSet,
        [valName]: (value, fields) => {
          if (value !== undefined && fields[rule.fieldName] === undefined) return true;
          if (value === undefined && fields[rule.fieldName] !== undefined) return true;
          return rule.message;
        },
      };
    case "noGapsOrOverlaps":
      return {
        ...valSet,
        [valName]: (_, fields) => {
          const fieldArray = fields[rule.fieldName];
          if (!fieldArray || !Array.isArray(fieldArray) || fieldArray.length <= 1) {
            return true; // No validation needed for 0 or 1 entry
          }

          const fromField = rule.fromField;
          const toField = rule.toField;

          const range = fieldArray.map((item: any) => ({
            from: parseInt(item[fromField], 10),
            to: parseInt(item[toField], 10),
          }));

          // Sort ranges by from value
          range.sort((a, b) => a.from - b.from);

          // Check for overlaps and gaps
          for (let i = 1; i < range.length; i++) {
            if (range[i].from < range[i - 1].to) {
              return "No age overlaps allowed";
            }
            if (range[i].from > range[i - 1].to) {
              return "No gaps between ages allowed";
            }
          }

          return true; // No issues found
        },
      };
    case "toGreaterThanFrom":
      return {
        ...valSet,
        [valName]: (value, formValues) => {
          const fromValue = parseInt(value, 10);
          const fieldArray = formValues[rule.fieldName];

          if (!fieldArray || !Array.isArray(fieldArray)) {
            return true; // Skip validation if field array is not valid
          }

          const currentIndex = fieldArray.findIndex((item) => item[rule.fromField] === value);
          if (currentIndex === -1) {
            return true; // Skip validation if current item is not found
          }

          const toValue = parseInt(fieldArray[currentIndex][rule.toField], 10);

          if (isNaN(fromValue) || isNaN(toValue)) {
            return true; // Skip validation if values are not valid numbers
          }

          return toValue > fromValue || rule.message || "To age must be greater than From age";
        },
      };
    default:
      return { ...valSet };
  }
};
