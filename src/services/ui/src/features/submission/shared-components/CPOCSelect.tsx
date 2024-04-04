import { useGetCPOCs } from "@/api";
import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";
import Select from "react-select";
import { cpocs } from "shared-types/opensearch";

type TypeSelectFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
};

export function CPOCSelect<TFieldValues extends FieldValues>({
  control,
  name,
}: TypeSelectFormFieldProps<TFieldValues>) {
  const { data } = useGetCPOCs<cpocs.Document>();

  const options = data
    ? data?.map((item) => ({
        value: item.id,
        label: `${item.lastName}, ${item.firstName}`,
      }))
    : [];

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
              value={
                options.find((option) => option.value === field.value) || null
              }
              onChange={(option) => field.onChange(option ? option.value : "")}
              options={options}
              closeMenuOnSelect={true}
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
