import { Control, FieldValues } from "react-hook-form";

import { FormLabel } from "../Inputs";
import { RHFSection } from "./Section";
import type { Document } from "./types";

export const RHFDocument = <TFieldValues extends FieldValues>(props: {
  document: Document;
  control: Control<TFieldValues>;
}) => {
  return (
    <div className="py-4">
      <div className="mb-5">
        <FormLabel className="font-bold text-4xl px-8 font-serif">
          {props.document.header}
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
  );
};
