import { FieldValues, useFieldArray } from "react-hook-form";
import { Plus } from "lucide-react";

import { RHFSlot } from "./Slot";
import { Button, FormField } from "../Inputs";
import { FieldGroupProps } from "./types";

export const FieldGroup = <TFields extends FieldValues>(
  props: FieldGroupProps<TFields>
) => {
  const fieldArr = useFieldArray({
    control: props.control,
    name: props.name,
  });

  const onAppend = () => {
    fieldArr.append(
      props.fields.reduce((ACC, S) => {
        ACC[S.name] = "";
        return ACC;
      }, {} as any)
    );
  };

  return (
    <div className="flex flex-col gap-4 w-max">
      {fieldArr.fields.map((FLD, index) => {
        return (
          <div className="flex flex-col gap-3" key={FLD.id}>
            {props.fields.map((SLOT) => {
              return (
                <FormField
                  //   shouldUnregister
                  key={`${SLOT.name}-${index}`}
                  control={props.control}
                  name={`${props.name}.${index}.${SLOT.name}` as any}
                  render={RHFSlot({
                    ...SLOT,
                    control: props.control,
                    name: `${props.name}.${index}.${SLOT.name}`,
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
