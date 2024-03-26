import { useGetTypes } from "@/api";
import * as Inputs from "@/components/Inputs";
import { Control, FieldValues, Path } from "react-hook-form";
import Select from "react-select";

type TypeSelectFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  authorityId: number;
};

type SelectOption = {
  value: number;
  label: string;
};

export function TypeSelect<TFieldValues extends FieldValues>({
  control,
  name,
  authorityId,
}: TypeSelectFormFieldProps<TFieldValues>) {
  const { data } = useGetTypes(authorityId);

  const options = data?.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  return (
    <Inputs.FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <Inputs.FormItem className="max-w-lg">
            <Inputs.FormLabel className="font-semibold block">
              Type <Inputs.RequiredIndicator />
            </Inputs.FormLabel>
            <p className="text-gray-500 max-w-3xl">
              You may select more than one
            </p>
            <Select
              isMulti
              value={
                field.value
                  ? field.value.map((id: number) =>
                      options?.find((O) => O.value === id),
                    )
                  : []
              }
              onChange={(val) =>
                field.onChange(val.map((v: SelectOption) => v.value))
              }
              options={options}
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
