import { Checkbox } from "@/components/Inputs";
import { FC } from "react";

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
      <Checkbox
        checked={yes}
        defaultChecked={yes}
        onCheckedChange={onYes}
        label="Yes"
      />
      <Checkbox
        checked={no}
        defaultChecked={no}
        onCheckedChange={onNo}
        label="No"
      />
    </div>
  );
};
