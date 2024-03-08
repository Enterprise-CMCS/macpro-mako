import { useEffect } from "react";
import { FieldValues, useFieldArray } from "react-hook-form";
import { FieldGroupProps } from "shared-types";
import { Plus } from "lucide-react";
import { RHFSlot } from "./Slot";
import { Button, FormField } from "../Inputs";
import { slotInitializer } from "./utils";

export const FieldGroup = <TFields extends FieldValues>(
  props: FieldGroupProps<TFields>
) => {
  const fieldArr = useFieldArray({
    control: props.control,
    name: props.name,
    shouldUnregister: true,
  });

  const onAppend = () => {
    fieldArr.append(props.fields.reduce(slotInitializer, {}) as never);
  };

  useEffect(() => {
    if (fieldArr.fields.length) return;
    fieldArr.append(props.fields.reduce(slotInitializer, {}) as never);
  }, []);

  return (
    <div className="flex flex-col gap-4 w-max">
      {fieldArr.fields.map((FLD, index) => {
        return (
          <div className="flex flex-col gap-3" key={FLD.id}>
            {props.fields.map((SLOT) => {
              const prefix = `${props.name}.${index}.`;
              const adjustedPrefix = (props.groupNamePrefix ?? "") + prefix;
              const adjustedSlotName = prefix + SLOT.name;
              return (
                <FormField
                  key={adjustedSlotName}
                  control={props.control}
                  name={adjustedSlotName as never}
                  {...(SLOT.rules && { rules: SLOT.rules })}
                  render={RHFSlot({
                    ...SLOT,
                    control: props.control,
                    name: adjustedSlotName,
                    groupNamePrefix: adjustedPrefix,
                  })}
                />
              );
            })}
            {index >= 1 && (
              <Button
                className="self-end m-2 mr-0"
                variant={"destructive"}
                onClick={() => {
                  fieldArr.remove(index);
                }}
              >
                {props.removeText ?? "Remove Group"}
              </Button>
            )}
            {fieldArr.fields.length > 1 && (
              <div className="w-full border-slate-300 border-2" />
            )}
          </div>
        );
      })}
      <div className="flex items-center mt-2 self-end">
        <Button type="button" size="sm" onClick={onAppend} variant="default">
          <Plus className="h-5 w-5 mr-2" />
          {props.appendText ?? "New Group"}
        </Button>
      </div>
    </div>
  );
};
