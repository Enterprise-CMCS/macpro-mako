import { type FC } from "react";
import Select from "react-select";

export interface Option {
  readonly value: string;
  readonly label: string;
  readonly color?: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}

export const FilterableSelect: FC<{
  options: Option[];
  value: string[];
  onChange: (values: string[]) => void;
}> = (props) => {
  return (
    <Select<any, any>
      isMulti
      value={props.value.map((S) => ({ value: S, label: S }))}
      onChange={(val) => props.onChange(val.map((s: any) => s.value))}
      options={props.options}
      closeMenuOnSelect={false}
      placeholder
    />
  );
};
