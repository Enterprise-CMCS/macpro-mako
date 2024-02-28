import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";

type DescriptionInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
};

export function DescriptionInput<TFieldValues extends FieldValues>({
  control,
  name,
}: DescriptionInputProps<TFieldValues>) {
  return (
    <Inputs.FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Inputs.FormItem className="max-w-xl">
          <Inputs.FormLabel className="font-semibold block">
            Description <Inputs.RequiredIndicator />
          </Inputs.FormLabel>
          <Inputs.Textarea {...field} className="h-[100px] resize-none" />
          <Inputs.FormMessage />
        </Inputs.FormItem>
      )}
    />
  );
}
