import { Control, FieldValues } from "react-hook-form";
import { FormLabel, FormField } from "../Inputs";
import { DependencyWrapper } from "./dependencyWrapper";
import { RHFSlot } from "./Slot";
import * as TRhf from "shared-types";

export const RHFFormGroup = <TFieldValues extends FieldValues>(props: {
  form: TRhf.FormGroup;
  control: Control<TFieldValues>;
  groupNamePrefix?: string;
}) => {
  return (
    <DependencyWrapper {...props.form}>
      <div className="py-4">
        {props.form.description && (
          <div className="mb-2">
            <FormLabel className="font-bold">
              {props.form?.description}
            </FormLabel>
          </div>
        )}
        <div className={props.form.wrapperStyling}>
          {props.form.slots.map((SLOT) => (
            <DependencyWrapper key={SLOT.name} {...SLOT}>
              <FormField
                control={props.control}
                name={((props.groupNamePrefix ?? "") + SLOT.name) as never}
                {...(SLOT.rules && { rules: SLOT.rules })}
                render={RHFSlot({
                  ...SLOT,
                  control: props.control as Control,
                  groupNamePrefix: props.groupNamePrefix,
                })}
              />
            </DependencyWrapper>
          ))}
        </div>
      </div>
    </DependencyWrapper>
  );
};
