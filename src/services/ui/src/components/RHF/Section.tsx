/* eslint-disable react/prop-types */
import { Control, FieldValues } from "react-hook-form";
import { FormLabel } from "../Inputs";
import { DependencyWrapper } from "./dependencyWrapper";
import { Section } from "./types";
import { RHFFormGroup } from "./FormGroup";

export const RHFSection = <TFieldValues extends FieldValues>(props: {
  section: Section;
  control: Control<TFieldValues>;
}) => {
  return (
    <DependencyWrapper {...props.section}>
      <div className="py-4">
        {props.section.title && (
          <div className="bg-primary p-4 w-full text-white">
            <FormLabel className="text-xl">{props.section.title}</FormLabel>
          </div>
        )}
        {props.section.form.map((FORM, index) => (
          <RHFFormGroup
            key={`rhf-form-${index}-${FORM.description}`}
            control={props.control}
            form={FORM}
          />
        ))}
      </div>
    </DependencyWrapper>
  );
};
