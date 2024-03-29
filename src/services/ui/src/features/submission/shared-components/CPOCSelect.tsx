import { useGetCPOCs } from "@/api";
import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";
import Select from "react-select";

type TypeSelectFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
};

export function CPOCSelect<TFieldValues extends FieldValues>({
  control,
  name,
}: TypeSelectFormFieldProps<TFieldValues>) {
  const { data } = useGetCPOCs();

  console.log(data);

  return (
    <Inputs.FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <Inputs.FormItem className="max-w-lg">
            <Inputs.FormLabel className="font-semibold block">
              CPOC <Inputs.RequiredIndicator />
            </Inputs.FormLabel>

            <Select
              value={field.value}
              onChange={(val) => field.onChange(val)}
              options={[{ Officer_ID: "hello", Email: "world" }] as any}
              closeMenuOnSelect={false}
              className="border border-black shadow-sm rounded-sm"
              placeholder="- Select -"
            />
            <Inputs.FormMessage />
          </Inputs.FormItem>
        );
      }}
    />
  );
}
