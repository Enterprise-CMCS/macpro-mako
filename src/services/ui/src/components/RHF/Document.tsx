import { Control, FieldValues } from "react-hook-form";

import { FormLabel } from "../Inputs";
import { RHFSection } from "./Section";
import { FormSchema } from "shared-types";

export const RHFDocument = <TFieldValues extends FieldValues>(props: {
  document: FormSchema;
  control: Control<TFieldValues>;
}) => {
  return (
    <div>
      <div className="h-[5px] bg-gradient-to-r from-primary from-50% to-[#02bfe7] to-[66%] rounded-t"></div>
      <div className="py-4 px-8 border-2 border-t-0 mt-0">
        <div className="mb-3 mt-9">
          <FormLabel className="font-bold text-4xl px-8 font-serif">
            {props.document?.header}
          </FormLabel>
        </div>
        {props.document.sections.map((SEC, index) => (
          <RHFSection
            key={`rhf-section-${index}-${SEC.title}`}
            control={props.control}
            section={SEC}
          />
        ))}
      </div>
    </div>
  );
};
