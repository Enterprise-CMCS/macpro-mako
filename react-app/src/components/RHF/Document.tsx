import { Control, FieldValues } from "react-hook-form";
import { FormSchema } from "shared-types";

import { RHFSection } from "./Section";

export const RHFDocument = <TFieldValues extends FieldValues>(props: {
  document: FormSchema;
  control: Control<TFieldValues>;
}) => {
  return (
    <div>
      <div className="h-[10px] bg-gradient-to-r from-primary from-50% to-[#02bfe7] to-[66%] rounded-t"></div>
      <div className="pt-4 px-8 border-2 border-t-0 mt-0">
        <div className="mb-3 mt-9">
          <h1 className="font-bold text-4xl px-8 pb-5 inline-block leading-[48px]">
            {props.document.header}
          </h1>
          {props.document.subheader && (
            <h2 className="font-bold text-1xl px-8 pb-5 inline-block leading-[48px]">
              {props.document.subheader}
            </h2>
          )}
        </div>
        {props.document.sections.map((SEC, index) => (
          <RHFSection
            key={`rhf-section-${index}-${SEC.title}`}
            formId={props.document.formId}
            control={props.control}
            section={SEC}
          />
        ))}
      </div>
    </div>
  );
};
