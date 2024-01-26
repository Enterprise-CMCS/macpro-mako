import {
  DatePicker,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
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
import { Link } from "react-router-dom";
import { FAQ_TAB } from "@/components/Routing/consts";

export const SlotPackageId = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  description,
  faqButtonLabel,
  faqHash,
  ...props
}: {
  label: ReactNode;
  description: ReactElement;
  faqButtonLabel: string;
  faqHash: string;
  className?: string;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({
    field,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
  }) {
    return (
      <FormItem {...props}>
        <div className="flex gap-4">
          <FormLabel className="text-lg font-bold">
            {label} <RequiredIndicator />
          </FormLabel>
          <Link
            to={`/faq/#${faqHash}`}
            target={FAQ_TAB}
            rel="noopener noreferrer"
            className="text-blue-700 hover:underline"
          >
            {faqButtonLabel}
          </Link>
        </div>
        {description}
        <FormControl className="max-w-sm">
          {/* eslint-disable-next-line react/jsx-no-undef */}
          <Input
            {...field}
            className={"mt-4"}
            onInput={(e) => {
              if (e.target instanceof HTMLInputElement) {
                e.target.value = e.target.value.toUpperCase();
              }
            }}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  };

export const SlotProposedEffectiveDate = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  ...props
}: {
  label: ReactNode;
  className?: string;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({
    field,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
  }) {
    return (
      <FormItem {...props}>
        <FormLabel className="text-lg font-bold block">
          {label} <RequiredIndicator />
        </FormLabel>
        <FormControl>
          <DatePicker onChange={field.onChange} date={field.value} />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  };

export const SlotAttachments = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  subtext,
  ...props
}: {
  label: ReactNode;
  subtext?: string;
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
        <FormDescription>{subtext}</FormDescription>
        <FormMessage />
      </FormItem>
    );
  };

export const SlotAdditionalInfo = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  description,
  ...props
}: {
  description: string;
  label?: ReactElement;
  className?: string;
}): ControllerProps<TFieldValues, TName>["render"] =>
  function Render({
    field,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
  }) {
    return (
      <FormItem {...props}>
        <FormLabel className="font-normal">{label}</FormLabel>
        <Textarea {...field} className="h-[200px] resize-none" />
        <FormDescription>{description}</FormDescription>
      </FormItem>
    );
  };
