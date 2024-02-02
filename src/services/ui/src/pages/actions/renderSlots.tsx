import {
  FormDescription,
  FormItem,
  FormLabel,
  RequiredIndicator,
  Textarea,
  Upload,
} from "@/components/Inputs";
import {
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { ReactElement, ReactNode } from "react";

export const SlotAttachments = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  message,
  ...props
}: {
  label: ReactNode;
  message: ReactNode;
  className?: string;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({
    field,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
  }) {
    return (
      <FormItem {...props}>
        <FormLabel>{label}</FormLabel>
        <Upload {...field} />
        {message}
      </FormItem>
    );
  };

export const SlotAdditionalInfo = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  description,
  required,
  ...props
}: {
  description: string;
  label?: ReactElement;
  required?: boolean;
  className?: string;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({
    field,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
  }) {
    return (
      <FormItem {...props}>
        <h3 className="font-bold text-2xl font-sans">
          Additional Information {required && <RequiredIndicator />}
        </h3>
        <FormLabel className="font-normal">{label}</FormLabel>
        <Textarea {...field} className="h-[200px] resize-none" />
        <FormDescription>{description}</FormDescription>
      </FormItem>
    );
  };
