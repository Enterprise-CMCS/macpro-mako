/* eslint-disable react/prop-types */
import { FieldValues, useFieldArray } from "react-hook-form";

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

  console.log("2props", props);
  console.log("2fieldArr", fieldArr);

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          {props.appendText ?? "New Group"}
        </Button>
      </div>
    </div>
  );
};
