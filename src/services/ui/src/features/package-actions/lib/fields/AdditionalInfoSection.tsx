import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  RequiredIndicator,
  Textarea,
} from "@/components";

export const AdditionalInfoSection = ({
  instruction,
  required,
}: {
  instruction?: ReactNode;
  required?: boolean;
}) => {
  const form = useFormContext();
  return (
    <section>
      <h2 className="font-bold text-2xl font-sans mb-2">
        Additional Info {required && <RequiredIndicator />}
      </h2>
      <FormField
        control={form.control}
        name={"additionalInformation"}
        render={({ field }) => (
          <FormItem>
            {instruction && (
              <FormLabel data-testid="addl-info-label" className="font-normal">
                {instruction}
              </FormLabel>
            )}
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
        )}
      />
    </section>
  );
};
