import { FieldValues } from "react-hook-form";
import {
  FieldArrayProps,
  FieldGroupProps,
  RHFSlotProps,
  RHFTextField,
} from "shared-types";
import { FormField, FormLabel } from "../Inputs/form";
import { DependencyWrapper, RHFSlot, RHFTextDisplay, ruleGenerator } from "./";

interface FieldProps<T extends FieldValues>
  extends FieldGroupProps<T>,
    FieldArrayProps<T> {
  index: number;
  SLOT: RHFSlotProps;
}

export const Field = <TFields extends FieldValues>({
  name,
  index,
  SLOT,
  control,
  parentId,
  ...props
}: FieldProps<TFields>) => {
  const prefix = `${name}.${index}.`;
  const adjustedPrefix = parentId + prefix;
  const adjustedSlotName = prefix + SLOT.name;

  // Wrapped Group
  if (SLOT.rhf === "WrappedGroup") {
    return (
      <div className="w-full">
        {(SLOT.label || SLOT.styledLabel) && (
          <FormLabel className={SLOT.labelClassName}>
            <RHFTextDisplay
              text={(SLOT.styledLabel || SLOT.label) as RHFTextField}
            />
          </FormLabel>
        )}
        <div
          className={SLOT.props?.wrapperClassName}
          key={`wrappedGroup-${name}-${index}`}
        >
          {SLOT.fields?.map((F) => {
            return (
              <Field
                {...{ name, index, control, parentId, ...props }}
                SLOT={F}
                key={F.name}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Base Field
  const formField = (
    <FormField
      key={adjustedSlotName}
      control={control}
      name={adjustedSlotName as never}
      rules={ruleGenerator(SLOT.rules, SLOT.addtnlRules)}
      render={RHFSlot({
        ...SLOT,
        control: control,
        name: adjustedSlotName,
        parentId: adjustedPrefix,
      })}
    />
  );

  // If the slot has a dependency, wrap it in a dependency wrapper.
  // Ensure the conditions are adjusted to the new name within the FieldGroup.
  // Otherwise, just return the form field:
  return SLOT.dependency ? (
    <DependencyWrapper
      {...SLOT}
      key={adjustedSlotName}
      name={adjustedSlotName}
      dependency={
        SLOT.dependency.conditions && {
          conditions: [
            {
              ...SLOT.dependency.conditions[0],
              name: `${prefix}${SLOT.dependency.conditions[0].name}`,
            },
          ],
          effect: SLOT.dependency.effect,
        }
      }
    >
      {formField}
    </DependencyWrapper>
  ) : (
    formField
  );
};
