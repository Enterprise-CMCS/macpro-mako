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
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
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
        <Upload files={field?.value ?? []} setFiles={field.onChange} />
        {message}
      </FormItem>
    );
  };

{
  /* TODO: Turn description into character count */
}
export const SlotAdditionalInfo = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  required,
  withoutHeading = false,
  ...props
}: {
  label?: ReactElement;
  required?: boolean;
  className?: string;
  /* we're in transition between two visual styles for forms (one uses
   * SectionCard to label sections with a heading, some use headers like
   * these). this is temporary to satisfy that transition. */
  withoutHeading?: boolean;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({
    field,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
  }) {
    return (
      <FormItem {...props}>
        {!withoutHeading ?? (
          <h3 className="font-bold text-2xl font-sans">
            Additional Information {required && <RequiredIndicator />}
          </h3>
        )}
        <FormLabel className="font-normal">{label}</FormLabel>
        <Textarea
          {...field}
          maxLength={4000}
          aria-describedby="character-count"
          aria-live="off"
          aria-multiline={true}
          className="h-[200px] resize-none"
        />
        <FormDescription>
          <span
            tabIndex={0}
            id="character-count"
            aria-label="character-count"
            aria-live="polite"
          >
            {`${4000 - (field?.value?.length || 0)} characters remaining`}
          </span>
        </FormDescription>
      </FormItem>
    );
  };
