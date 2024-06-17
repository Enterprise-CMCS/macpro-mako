import { type FC } from "react";
import Select from "react-select";
import { MultiselectOption } from "shared-types";

export const Multiselect: FC<{
  options: MultiselectOption[];
  value: string[];
  onChange: (values: string[]) => void;
}> = (props) => {
  return (
    <Select<any, any>
      isMulti={true}
      value={props.value?.map((str) => ({ value: str, label: str }))}
      onChange={(val) => props.onChange(val.map((s: any) => s.value) || [])}
      options={props.options}
      closeMenuOnSelect={false}
      placeholder
    />
  );
};
