// @ts-nocheck
import { Control, FieldValues } from "react-hook-form";
import * as TRhf from "shared-types";
import { FormLabel, FormField } from "../Inputs";
import { DependencyWrapper } from "./dependencyWrapper";
import { RHFSlot } from "./Slot";

export const RHFFormGroup = <TFieldValues extends FieldValues>(props: {
  form: TRhf.FormGroup;
  control: Control<TFieldValues>;
  parentId?: string;
  className?: string;
}) => {
  return (
    <DependencyWrapper {...props.form}>
      <div className={props.className ? props.className : "py-2"}>
        {props.form.description && (
          <div className="mb-2">
            <FormLabel
              className={props.form.descriptionClassName || "font-bold"}
            >
              {props.form.description}
            </FormLabel>
          </div>
        )}
        <div className={props.form.wrapperClassName}>
          {props.form.slots.map((SLOT) => (
            <DependencyWrapper key={props.parentId + SLOT.name} {...SLOT}>
              <FormField
                control={props.control}
                name={(props.parentId + SLOT.name) as never}
                {...(SLOT.rules && { rules: SLOT.rules })}
                render={RHFSlot({
                  ...SLOT,
                  control: props.control as Control,
                  name: props.parentId + SLOT.name,
                  parentId: props.parentId,
                })}
              />
            </DependencyWrapper>
          ))}
        </div>
      </div>
    </DependencyWrapper>
  );
};
