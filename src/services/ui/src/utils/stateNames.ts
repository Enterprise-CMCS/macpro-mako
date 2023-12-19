import { useLabelMapping } from "@/hooks";

export const convertStateAbbreviations = (
  input: string | undefined
): string => {
  const labelMap = useLabelMapping();

  if (input === undefined) {
    return "";
  }

  const abbreviations = input.split(",");
  const fullNames = abbreviations.map(
    (abbr) => labelMap[abbr].split(",")[0] || abbr
  );
  return fullNames.join(", ");
};
