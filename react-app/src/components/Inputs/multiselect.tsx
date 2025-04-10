import { type FC } from "react";
import Select, { StylesConfig } from "react-select";
import { MultiselectProps } from "shared-types";

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

export const Multiselect: FC<MultiselectProps> = ({ options, ...props }) => {
  return (
    <Select<any, any>
      isMulti={true}
      options={options}
      closeMenuOnSelect={false}
      placeholder
      styles={customStyles}
      {...props}
    />
  );
};
