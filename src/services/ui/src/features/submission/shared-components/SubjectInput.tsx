import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";

type SubjectInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
};

export function SubjectInput<TFieldValues extends FieldValues>({
  control,
  name,
}: SubjectInputProps<TFieldValues>) {
  return (
    <Inputs.FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Inputs.FormItem className="max-w-xl">
          <Inputs.FormLabel className="text-lg font-bold block">
            Subject <Inputs.RequiredIndicator />
          </Inputs.FormLabel>
          <Inputs.FormControl>
            <Inputs.Input {...field} />
          </Inputs.FormControl>
          <Inputs.FormMessage />
        </Inputs.FormItem>
      )}
    />
  );
}
