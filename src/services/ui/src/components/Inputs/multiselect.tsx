import { type FC } from "react";
import Select, { StylesConfig } from "react-select";
import { MultiselectOption } from "shared-types";

const customStyles: StylesConfig = {
  control: (provided) => ({
    ...provided,
    border: "1px solid black",
    boxShadow: "none",
    "&:hover": {
      border: "1px solid black",
    },
  }),
};

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
      styles={customStyles}
    />
  );
};
