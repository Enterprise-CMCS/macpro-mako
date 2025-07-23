import Select from "react-select";

export interface Option {
  readonly value: string;
  readonly label: string;
  readonly color?: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}

export type FilterableSelectProps = {
  options: Option[];
  value: string[];
  placeholder?: string;
  onChange: (values: string[]) => void;
  selectedDisplay?: keyof Option;
  ariaLabel?: string;
};

export const FilterableSelect = ({
  options,
  value,
  placeholder,
  onChange,
  selectedDisplay,
  ariaLabel,
}: FilterableSelectProps) => {
  const getLabel = (value) => {
    if (selectedDisplay !== "label") return value;
    const selected = options.filter((option: Option) => option.value === value) as Option[];
    return selected[0].label;
  };

  return (
    <Select<any, any>
      isMulti
      value={value.map((selected) => ({ value: selected, label: getLabel(selected) }))}
      onChange={(value) => onChange(value.map((selected: any) => selected.value))}
      options={options}
      closeMenuOnSelect={false}
      blurInputOnSelect={false}
      placeholder={placeholder}
      autoFocus
      tabSelectsValue={false}
      aria-label={ariaLabel}
      onBlur={(event) => {
        const header = document.getElementById(event.relatedTarget.id);
        header?.focus();
      }}
    />
  );
};
