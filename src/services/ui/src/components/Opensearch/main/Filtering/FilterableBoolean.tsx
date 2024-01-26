import { Checkbox } from "@/components/Inputs";
import { useState } from "react";

type Props = {
  value: boolean | null;
  onChange: (val: boolean) => void;
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
  const [yes, setYes] = useState<boolean | null>(
    props.value === null ? null : props.value
  );
  const [no, setNo] = useState<boolean | null>(
    props.value === null ? null : !props.value
  );

  const handleYes = (mhm: boolean) => {
    setYes(mhm);
    if (no) setNo(false);
  };

  const handleNo = (mhm: boolean) => {
    setNo(mhm);
    if (yes) setYes(false);
  };

  return (
    <div className="flex flex-col gap-3 items-start">
      <Checkbox checked={!!yes} onCheckedChange={handleYes} label="Yes" />
      <Checkbox checked={!!no} onCheckedChange={handleNo} label="No" />
    </div>
  );
};
