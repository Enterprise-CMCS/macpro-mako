/* eslint-disable react/prop-types */
import { Control, FieldValues } from "react-hook-form";
import { FormLabel, FormField } from "../Inputs";
import { DependencyWrapper } from "./dependencyWrapper";
import { RHFSlot } from "./Slot";
import * as TRhf from "./types";

export const RHFFormGroup = <TFieldValues extends FieldValues>(props: {
  form: TRhf.FormGroup;
  control: Control<TFieldValues>;
}) => {
  return (
    <DependencyWrapper {...props.form}>
      <div className="py-2">
        {props.form.description && (
          <div className="mb-6">
            <FormLabel className="font-bold">
              {props.form?.description}
            </FormLabel>
          </div>
        )}
        <div className={props.form.wrapperStyling}>
          {props.form.slots.map((SLOT) => {
            return (
              <DependencyWrapper key={SLOT.name} {...SLOT}>
                <FormField
                  control={props.control}
                  name={SLOT.name as any}
                  render={RHFSlot({ ...SLOT, control: props.control })}
                />
              </DependencyWrapper>
            );
          })}
        </div>
      </div>
    </DependencyWrapper>
  );
};
