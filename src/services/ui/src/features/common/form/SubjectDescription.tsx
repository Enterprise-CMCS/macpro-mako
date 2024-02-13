import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";

type SubjectDescriptionFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  subjectFieldName: Path<TFieldValues>;
  descriptionFieldName: Path<TFieldValues>;
};

export function SubjectDescription<TFieldValues extends FieldValues>({
  control,
  subjectFieldName,
  descriptionFieldName,
}: SubjectDescriptionFormFieldProps<TFieldValues>) {
  return (
    <>
      <Inputs.FormField
        control={control}
        name={subjectFieldName}
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
      <Inputs.FormField
        control={control}
        name={descriptionFieldName}
        render={({ field }) => (
          <Inputs.FormItem className="max-w-xl">
            <Inputs.FormLabel className="text-lg font-bold block">
              Description <Inputs.RequiredIndicator />
            </Inputs.FormLabel>
            <Inputs.Textarea {...field} className="h-[100px] resize-none" />
            <Inputs.FormMessage />
          </Inputs.FormItem>
        )}
      />
    </>
  );
}
