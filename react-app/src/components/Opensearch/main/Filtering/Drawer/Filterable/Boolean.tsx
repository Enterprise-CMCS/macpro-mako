import { FC } from "react";

import { Checkbox } from "@/components";

export const FilterableBoolean: FC<{
  value: boolean | null;
  onChange: (val: boolean | null) => void;
}> = (props) => {
  const yes = props.value === null ? false : props.value;
  const no = props.value === null ? false : !props.value;

  const onYes = (mhm: boolean) => {
    props.onChange(mhm ? true : null);
  };

  const onNo = (mhm: boolean) => {
    props.onChange(mhm ? false : null);
  };

  return (
    <div className="flex flex-col items-start">
      <Checkbox checked={yes} onCheckedChange={onYes} label="Yes" id="yes" />
      <Checkbox checked={no} onCheckedChange={onNo} label="No" id="no" />
    </div>
  );
};
