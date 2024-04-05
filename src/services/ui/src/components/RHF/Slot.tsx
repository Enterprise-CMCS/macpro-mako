/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import type { RHFSlotProps } from "shared-types";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Inputs";
import { RHFTextDisplay } from ".";
import { SlotField } from "./SlotField";

export const RHFSlot = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  label,
  description,
  descriptionAbove,
  descriptionStyling,
  labelStyling,
  formItemStyling,
  ...rest
}: RHFSlotProps & { control: any }): ControllerProps<
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
        className={`flex flex-col gap-1 py-2${
          formItemStyling ? ` ${formItemStyling}` : ""
        }`}
        data-testid={rest.name + "Wrapper"}
      >
        {label && (
          <FormLabel className={labelStyling}>
            <RHFTextDisplay text={label} />
          </FormLabel>
        )}
        {descriptionAbove && description && (
          <FormDescription className={descriptionStyling}>
            <RHFTextDisplay text={description} />
          </FormDescription>
        )}
        <FormControl>
          <SlotField {...rest} control={control} field={field} />
        </FormControl>
        {description && !descriptionAbove && (
          <FormDescription className={descriptionStyling}>
            <RHFTextDisplay text={description} />
          </FormDescription>
        )}
        <FormMessage />
      </FormItem>
    );
  };
