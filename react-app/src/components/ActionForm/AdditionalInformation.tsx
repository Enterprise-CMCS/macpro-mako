import { z } from "zod";
import { SchemaWithEnforcableProps } from ".";
import { FormDescription, FormItem, FormLabel, Textarea } from "../Inputs";
import { ControllerRenderProps, FieldPath } from "react-hook-form";

type AdditionalInformationProps<Schema extends SchemaWithEnforcableProps> = {
  label: string;
  field: ControllerRenderProps<z.TypeOf<Schema>, FieldPath<z.TypeOf<Schema>>>;
};

export const AdditionalInformation = <
  Schema extends SchemaWithEnforcableProps,
>({
  label,
  field,
}: AdditionalInformationProps<Schema>) => (
  <FormItem>
    <FormLabel
      htmlFor="additional-info"
      data-testid="addl-info-label"
      className="font-normal"
    >
      {label}
    </FormLabel>
    <Textarea
      {...field}
      maxLength={4000}
      aria-describedby="character-count"
      aria-live="off"
      aria-multiline={true}
      className="h-[200px] resize-none"
      id="additional-info"
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
