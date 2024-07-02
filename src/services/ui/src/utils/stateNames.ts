import { useLabelMapping } from "@/hooks";
import { useState, useEffect } from "react";

export const useConvertStateAbbreviations = (input: string | undefined): string => {
  const [convertedNames, setConvertedNames] = useState<string>("");
  const labelMap = useLabelMapping();

  useEffect(() => {
    if (input === undefined) {
      setConvertedNames("");
      return;
    }

    const abbreviations = input.split(",");
    const fullNames = abbreviations.map(
      (abbr) => labelMap[abbr]?.split(",")[0] || abbr
    );
    setConvertedNames(fullNames.join(", "));
  }, [input, labelMap]);

  return convertedNames;
};
