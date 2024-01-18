import { FieldValues, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { RHFSlot } from "./Slot";
import { Button, FormField } from "../Inputs";
import { FieldArrayProps } from "shared-types";
import { slotInitializer } from "./utils";
import { useEffect } from "react";

export const RHFFieldArray = <TFields extends FieldValues>(
  props: FieldArrayProps<TFields>
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
          <div className="flex flex-row gap-3" key={FLD.id}>
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
              <Trash2
                className="self-end mb-4 cursor-pointer stroke-primary"
                onClick={() => fieldArr.remove(index)}
              />
            )}
          </div>
        );
      })}
      <div className="flex items-center mt-2">
        <Button type="button" size="sm" onClick={onAppend} variant="outline">
          <Plus className="h-5 w-5 mr-2" />
          {props.appendText ?? "New Row"}
        </Button>
      </div>
    </div>
  );
};
