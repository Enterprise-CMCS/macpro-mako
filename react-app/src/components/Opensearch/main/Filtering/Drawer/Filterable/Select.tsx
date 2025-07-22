import { type FC, useEffect, useRef } from "react";
import Select, { components } from "react-select";

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
  const ref = useRef();

  useEffect(() => {
    console.log({ ref });
  }, [ref]);

  const getLabel = (value) => {
    if (selectedDisplay !== "label") return value;
    const selected = options.filter((option: Option) => option.value === value) as Option[];
    return selected[0].label;
  };

  const Input = (props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tabIndex, ...rest } = props;
    return <components.Input {...rest} />;
  };

  return (
    <div ref={ref}>
      <Select<any, any>
        isMulti
        value={value.map((selected) => ({ value: selected, label: getLabel(selected) }))}
        onChange={(value) => onChange(value.map((selected: any) => selected.value))}
        options={options}
        closeMenuOnSelect={false}
        placeholder={placeholder}
        // autoFocus
        tabSelectsValue={false}
        aria-label={ariaLabel}
        components={{ Input }}
      />
    </div>
  );
};
