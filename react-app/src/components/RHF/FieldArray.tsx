import { useLayoutEffect } from "react";
import { FieldValues, useFieldArray } from "react-hook-form";
import { FieldArrayProps } from "shared-types";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../Inputs";
import { slotInitializer } from "./utils";
import { Field } from "./Field";
import { cn } from "@/utils";

export const RHFFieldArray = <TFields extends FieldValues>(props: FieldArrayProps<TFields>) => {
  const fieldArr = useFieldArray<any>({
    control: props.control,
    name: props.name,
    shouldUnregister: true,
  });

  // initialize array if necessary
  if (fieldArr.fields.length == 0) {
    fieldArr.append(props.fields.reduce(slotInitializer(), {}) as never);
  }

  const onAppend = () => {
    fieldArr.append(props.fields.reduce(slotInitializer(), {}) as never);
  };

  // on-load or if the element id changes, scroll this element into view
  useLayoutEffect(() => {
    const element = document.getElementById(props.name);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }, [props.name]);

  return (
    <div className={"flex flex-col gap-6 w-full"} id={props.name}>
      {fieldArr.fields.map((FLD, index) => {
        return (
          <div className={cn("flex flex-row gap-6", props.fieldArrayClassName)} key={FLD.id}>
            {props.fields.map((SLOT, i) => {
              return <Field key={`${SLOT.name}-${i}`} {...props} index={index} SLOT={SLOT} />;
            })}
            {/* FieldArray Removal */}
            {index >= 1 && !props.removeText && (
              <Trash2
                className="self-end mb-2 cursor-pointer stroke-primary"
                data-testid={`removeRowButton-${index}`}
                onClick={() => fieldArr.remove(index)}
              />
            )}
            {/* FieldGroup Removal */}
            {index >= 1 && props.removeText && (
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
            {props.divider && <div className="w-full border-slate-300 border-b-[1px]" />}
          </div>
        );
      })}
      {props.lastDivider && (
        <div className={cn("w-full border-slate-300 border-b-[1px]", props.lastDivider)} />
      )}
      <div className={cn("flex items-center", props.appendClassName)}>
        <Button
          type="button"
          size="sm"
          onClick={onAppend}
          data-testid={`appendRowButton-${props.name}`}
          variant={props.appendVariant ?? "outline"}
        >
          <Plus className="h-5 w-5 mr-2" />
          {props.appendText || "New Row"}
        </Button>
      </div>
    </div>
  );
};
