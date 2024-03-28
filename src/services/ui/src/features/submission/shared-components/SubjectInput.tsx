import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";

type SubjectInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  helperText: string
};

export function SubjectInput<TFieldValues extends FieldValues>({
  control,
  name,
  helperText
}: SubjectInputProps<TFieldValues>) {
  return (
    <Inputs.FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Inputs.FormItem className="max-w-sm">
          <Inputs.FormLabel className="font-semibold block">
            Subject <Inputs.RequiredIndicator />
          </Inputs.FormLabel>
          <p className="text-gray-500">{helperText}</p>
          <Inputs.FormControl>
            <Inputs.Input {...field} />
          </Inputs.FormControl>
          <Inputs.FormMessage />
        </Inputs.FormItem>
      )}
    />
  );
}
