/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import type { RHFSlotProps, RHFTextField } from "shared-types";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Inputs";
import { RHFTextDisplay } from ".";
import { SlotField } from "./SlotField";
import { cn } from "@/utils";

export const RHFSlot = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  label,
  styledLabel,
  description,
  descriptionAbove,
  descriptionClassName,
  labelClassName,
  formItemClassName,
  horizontalLayout,
  ...rest
}: RHFSlotProps & { control: any; parentId?: string }): ControllerProps<
  TFieldValues,
  TName
>["render"] =>
  function SlotFormWrapper({ field }) {
    // added to unregister/reset inputs when removed from dom
    useEffect(() => {
      return () => {
        control.unregister(field.name);
      };
    }, []);

    return (
      <FormItem
        className={cn(`flex gap-1 pb-4${
          formItemClassName ? ` ${formItemClassName}` : ""
        }
        ${horizontalLayout ? "" : " flex-col"}
        `)}
        data-testid={rest.name + "Wrapper"}
      >
        {(label || styledLabel) && (
          <FormLabel className={labelClassName}>
            <RHFTextDisplay text={(styledLabel || label) as RHFTextField} />
          </FormLabel>
        )}
        {descriptionAbove && description && (
          <FormDescription className={descriptionClassName}>
            <RHFTextDisplay text={description} />
          </FormDescription>
        )}
        <FormControl>
          <SlotField
            {...rest}
            horizontalLayout={horizontalLayout}
            control={control}
            field={field}
          />
        </FormControl>
        {description && !descriptionAbove && (
          <FormDescription className={descriptionClassName}>
            <RHFTextDisplay text={description} />
          </FormDescription>
        )}
        <FormMessage />
      </FormItem>
    );
  };
