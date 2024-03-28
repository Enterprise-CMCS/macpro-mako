import { SectionCard } from "@/components";
import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";

type AdditionalInfoFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
};

export function AdditionalInfoInput<TFieldValues extends FieldValues>({
  control,
  name,
}: AdditionalInfoFieldProps<TFieldValues>) {
  return (
    <SectionCard title="Additional Information">
      <Inputs.FormField
        control={control}
        name={name}
        render={({ field }) => (
          <Inputs.FormItem>
            <Inputs.FormLabel className="text-gray-700 font-light">
              Add anything else you would like to share with CMS
            </Inputs.FormLabel>
            <Inputs.Textarea {...field} className="h-[200px] resize-none" />
            <Inputs.FormDescription>
              4,000 characters allowed
            </Inputs.FormDescription>
          </Inputs.FormItem>
        )}
      />
    </SectionCard>
  );
}
