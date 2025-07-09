import * as SelectPrimitive from "@radix-ui/react-select";
import { type FC } from "react";
import SelectRS from "react-select";

const Select = SelectPrimitive.Root;

const SelectTrigger = SelectPrimitive.Trigger;

const SelectPortal = SelectPrimitive.Portal;

const SelectContent = SelectPrimitive.Content;

const SelectViewport = SelectPrimitive.Viewport;

const SelectItem = SelectPrimitive.Item;

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
  const getLabel = (value) => {
    if (selectedDisplay !== "label") return value;
    const selected = options.filter((option) => option.value === value);
    return selected[0].label;
  };
  return (
    // <SelectRS<any, any>
    //   isMulti
    //   value={value.map((selected) => ({ value: selected, label: getLabel(selected) }))}
    //   onChange={(value) => onChange(value.map((selected: any) => selected.value))}
    //   options={options}
    //   closeMenuOnSelect={false}
    //   placeholder={placeholder}
    //   autoFocus
    //   tabSelectsValue={false}
    // />

    <Select.Root>
      <Select.Trigger>…</Select.Trigger>
      <Select.Portal>
        <Select.Content>
          <Select.Viewport>
            <Select.Item className="SelectItem" disabled>
              …
            </Select.Item>
            <Select.Item>…</Select.Item>
            <Select.Item>…</Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
