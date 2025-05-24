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
  placeholder?: string;
  onChange: (values: string[]) => void;
  selectedDisplay?: keyof Option;
}> = ({ options, value, placeholder, onChange, selectedDisplay = "value" }) => {
  return (
    <Select<any, any>
      isMulti
      value={value.map((S) => ({ value: S, label: S }))}
      onChange={(val) => onChange(val.map((s: any) => s[selectedDisplay]))}
      options={options}
      closeMenuOnSelect={false}
      placeholder={placeholder}
    />
  );
};
