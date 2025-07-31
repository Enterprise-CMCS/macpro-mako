import type * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import { Label } from "@/components/Inputs";
import { cn } from "@/utils";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: fieldContext.name,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={className} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    className?: string;
    htmlFor?: string;
  }
>(({ className, htmlFor, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={htmlFor || formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { className?: string }
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return <p ref={ref} id={formDescriptionId} className={className} {...props} />;
});
FormDescription.displayName = "FormDescription";

// Screen readers re-read a live region only if its text content changes.
// When announceOn changes, it triggers re-announce
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    className?: string;
    announceOn?: unknown;
    debounceMs?: number;
  }
>(({ className, children, announceOn, debounceMs = 1000, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const [announceCounter, setAnnounceCounter] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  const body = error && !Array.isArray(error) ? String(error?.message) : children;
  const shouldAnnounce = announceOn !== null && !!body;

  // Increasing announceCounter forces re-render; the live-region now has “new” content
  // Forcing screen readers to reannounce error on every keystroke.
  useEffect(() => {
    if (!shouldAnnounce) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setAnnounceCounter((n) => n + 1);
    }, debounceMs) as unknown as number;
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [announceOn, body, shouldAnnounce, debounceMs]);

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      role="status"
      aria-live="polite"
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
      {/* Invisible text that changes every keystroke so screen recoders re-read error */}
      {shouldAnnounce && <span className="sr-only">invalid {announceCounter}</span>}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
