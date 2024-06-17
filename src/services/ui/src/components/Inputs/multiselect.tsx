import { type FC } from "react";
import Select from "react-select";
import { MultiselectOption } from "shared-types";
import { cn } from "@/utils";

export const Multiselect: FC<{
  options: MultiselectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  className?: string;
}> = (className, props) => {
  return (
    <Select<any, any>
      isMulti={true}
      value={props.value?.map((str: string) => ({ value: str, label: str }))}
      onChange={(val) => props.onChange(val.map((s: any) => s.value) || [])}
      options={props.options}
      closeMenuOnSelect={false}
      className={cn("rounded-sm border border-black", className)}
    />
  );
};
