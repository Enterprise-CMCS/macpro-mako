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
  ariaLabel?: string;
}> = ({ options, value, placeholder, onChange, selectedDisplay = "value", ariaLabel }) => {
  const getLabel = (value) => {
    if (selectedDisplay !== "label") return value;
    const selected = options.filter((option) => option.value === value);
    return selected[0].label;
  };
  return (
    <Select<any, any>
      isMulti
      value={value.map((selected) => ({ value: selected, label: getLabel(selected) }))}
      onChange={(value) => onChange(value.map((selected: any) => selected.value))}
      options={options}
      closeMenuOnSelect={false}
      placeholder={placeholder}
      autoFocus
      tabSelectsValue={false}
      aria-label={ariaLabel}
    />
  );
};
