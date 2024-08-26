import { RegisterOptions } from "react-hook-form";
import { RuleGenerator, SortFuncs, AdditionalRule } from "shared-types";

export const sortFunctions: {
  [x in SortFuncs]: (a: string, b: string) => number;
} = {
  noSort: () => 0,
  reverseSort: (a, b) => b.localeCompare(a),
};

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
        [valName]: (value, fields) => {
          const fieldArray = fields[rule.fieldName];
          if (!fieldArray || !Array.isArray(fieldArray)) {
            return true; // If the field is not an array, we can't check for gaps
          }

          const fromField = (rule as any).fromField || "from-age";
          const toField = (rule as any).toField || "to-age";
          const optionsField = (rule as any).optionsField || fromField;

          const ageRanges = fieldArray.map((item: any) => ({
            from: parseInt(item[fromField], 10),
            to: parseInt(item[toField], 10),
          }));

          // Sort the age ranges
          ageRanges.sort((a, b) => a.from - b.from);

          // Get the min and max values from the options
          const options = fields[optionsField]?.props?.options || [];
          const minValue = parseInt(options[0]?.value, 10) || 0;
          const maxValue = parseInt(options[options.length - 1]?.value, 10) || 19;

          // Check for gaps and overlaps
          for (let i = 0; i < ageRanges.length; i++) {
            if (i === 0 && ageRanges[i].from !== minValue) {
              return rule.message; // Gap at the beginning
            }
            if (i > 0) {
              if (ageRanges[i].from > ageRanges[i - 1].to + 1) {
                return rule.message; // Gap between ranges
              }
              if (ageRanges[i].from <= ageRanges[i - 1].to) {
                return rule.message; // Overlap between ranges
              }
            }
          }

          // Check if the last range ends at the maximum value
          if (ageRanges[ageRanges.length - 1].to !== maxValue) {
            return rule.message; // Gap at the end
          }

          return true; // No gaps or overlaps found
        },
      };
    default:
      return { ...valSet };
  }
};
