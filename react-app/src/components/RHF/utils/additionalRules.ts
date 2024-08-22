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
    case "noOverlappingAges":
      return {
        ...valSet,
        [valName]: (value: any[]) => {
          if (!value || value.length < 2) return true;
          
          const sortedRanges = [...value].sort((a, b) => 
            parseInt(a['from-age']) - parseInt(b['from-age'])
          );

          for (let i = 0; i < sortedRanges.length - 1; i++) {
            const currentRange = sortedRanges[i];
            const nextRange = sortedRanges[i + 1];
            
            if (parseInt(currentRange['to-age']) >= parseInt(nextRange['from-age'])) {
              return false;
            }
          }

          return true;
        },
      };
    default:
      return { ...valSet };
  }
};
