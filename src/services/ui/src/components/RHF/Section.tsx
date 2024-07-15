/* eslint-disable react/prop-types */
import { Control, FieldValues } from "react-hook-form";
import { Section } from "shared-types";
import { FormLabel } from "../Inputs";
import { DependencyWrapper, RHFFormGroup } from ".";

export const RHFSection = <TFieldValues extends FieldValues>(props: {
  section: Section;
  formId: string;
  control: Control<TFieldValues>;
}) => {
  return (
    <DependencyWrapper {...props.section}>
      <div>
        {props.section.title && (
          <div
            className={
              "py-4 px-8 w-full " +
              (props.section.subsection
                ? "bg-gray-300 text-2xl"
                : "bg-primary text-white text-3xl")
            }
          >
            <FormLabel className="font-bold">{props.section.title}</FormLabel>
          </div>
        )}
        {props.section.form?.length ? (
          <div className="px-8 pt-6 pb-2">
            {props.section.form.map((FORM, index) => (
              <RHFFormGroup
                key={`rhf-form-${index}-${FORM.description}`}
                parentId={props.formId + "_" + props.section.sectionId + "_"}
                control={props.control}
                form={FORM}
              />
            ))}
          </div>
        ) : (
          <></>
        )}
      </div>
    </DependencyWrapper>
  );
};
