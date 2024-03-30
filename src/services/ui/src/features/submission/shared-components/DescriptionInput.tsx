import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";

type DescriptionInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  helperText: string;
};

export function DescriptionInput<TFieldValues extends FieldValues>({
  control,
  name,
  helperText,
}: DescriptionInputProps<TFieldValues>) {
  return (
    <Inputs.FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Inputs.FormItem>
          <Inputs.FormLabel className="font-semibold block">
            Description <Inputs.RequiredIndicator />
          </Inputs.FormLabel>
            <p className="text-gray-500 max-w-3xl">{helperText}</p>
          <Inputs.Textarea
            {...field}
            className="h-[100px] resize-none max-w-lg"
          />
          <Inputs.FormMessage />
        </Inputs.FormItem>
      )}
    />
  );
}
