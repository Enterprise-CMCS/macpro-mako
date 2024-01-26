import { Checkbox } from "@/components/Inputs";
import { useEffect, useState } from "react";

type Props = {
  value: boolean | null;
  onChange: (val: boolean | null) => void;
};

/**
 * @what -
 * - Filterable Group for boolean fields
 * @why -
 * - So users can filter by simple true/false boolean fields.
 * @concerns -
 * - Probably the easiest of the filterables
 */
export const FilterableBoolean = (props: Props) => {
  const yes = !!(props.value === null ? null : props.value);
  const no = !!(props.value === null ? null : !props.value);

  const handleYes = (mhm: boolean) => {
    props.onChange(mhm ? true : null);
  };

  const handleNo = (mhm: boolean) => {
    props.onChange(mhm ? false : null);
  };

  return (
    <div className="flex flex-col items-start">
      <Checkbox
        checked={yes}
        defaultChecked={yes}
        onCheckedChange={handleYes}
        label="Yes"
      />
      <Checkbox
        checked={no}
        defaultChecked={no}
        onCheckedChange={handleNo}
        label="No"
      />
    </div>
  );
};
