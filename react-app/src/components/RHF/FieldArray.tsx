import { useEffect } from "react";
import { FieldValues, useFieldArray } from "react-hook-form";
import { FieldArrayProps } from "shared-types";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../Inputs";
import { slotInitializer } from "./utils";
import { Field } from "./Field";
import { cn } from "@/utils";

export const RHFFieldArray = <TFields extends FieldValues>(
  props: FieldArrayProps<TFields>,
) => {
  const isFieldArray = props.rhf === "FieldArray";
  const fieldArr = useFieldArray<any>({
    control: props.control,
    name: props.name,
    shouldUnregister: true,
  });

  const onAppend = () => {
    fieldArr.append(props.fields.reduce(slotInitializer(), {}) as never);
  };

  useEffect(() => {
    if (fieldArr.fields.length) return;
    fieldArr.append(props.fields.reduce(slotInitializer(), {}) as never);
  }, [fieldArr, props.fields]);

  return (
    <div className={"flex flex-col gap-4 w-full"}>
      {fieldArr.fields.map((FLD, index) => {
        return (
          <div
            className={cn(
              `flex flex-${isFieldArray ? "row" : "col"} gap-3 `,
              props.fieldArrayClassName,
            )}
            key={FLD.id}
          >
            {props.fields.map((SLOT, i) => {
              return (
                <Field
                  key={`${SLOT.name}-${i}`}
                  {...props}
                  index={index}
                  SLOT={SLOT}
                />
              );
            })}
            {/* FieldArray Removal */}
            {index >= 1 && isFieldArray && (
              <Trash2
                className="self-end mb-4 cursor-pointer stroke-primary"
                data-testid={`removeRowButton-${index}`}
                onClick={() => fieldArr.remove(index)}
              />
            )}
            {/* FieldGroup Removal */}
            {index >= 1 && !isFieldArray && (
              <Button
                className="self-end m-2 mr-0"
                variant={"destructive"}
                data-testid={`removeGroupButton-${index}`}
                onClick={() => {
                  fieldArr.remove(index);
                }}
              >
                {props.removeText ?? "Remove Group"}
              </Button>
            )}
            {fieldArr.fields.length > 1 && !isFieldArray && (
              <div className="w-full border-slate-300 border-2" />
            )}
          </div>
        );
      })}
      <div
        className={`flex items-center mt-2 ${isFieldArray ? "" : "self-end"}`}
      >
        <Button
          type="button"
          size="sm"
          onClick={onAppend}
          data-testid={`appendRowButton-${props.name}`}
          variant={isFieldArray ? "outline" : "default"}
        >
          <Plus className="h-5 w-5 mr-2" />
          {props.appendText || (isFieldArray ? "New Row" : "New Group")}
        </Button>
      </div>
    </div>
  );
};
