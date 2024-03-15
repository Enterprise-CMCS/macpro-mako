import { useEffect, useMemo } from "react";
import { useGetSubTypes } from "@/api";
import * as Inputs from "@/components/Inputs";
import { FieldValues, Path, useFormContext } from "react-hook-form";
import Select from "react-select";
import { uniqBy } from "lodash";

type SubTypeSelectFormFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  authorityId: number;
};
type SelectOption = {
  value: number;
  label: string;
};

export function SubTypeSelect<TFieldValues extends FieldValues>({
  name,
  authorityId,
}: SubTypeSelectFormFieldProps<TFieldValues>) {
  const { control, setValue, watch } = useFormContext();
  const currentValue = watch("typeIds", []);
  const { data } = useGetSubTypes(authorityId, currentValue, {
    enabled: currentValue.length > 0,
  });

  const options = useMemo(
    () =>
      uniqBy(data, "name").map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [data],
  );

  useEffect(() => {
    const validValues = currentValue?.filter((val: number) =>
      options.find((option) => option.value === val),
    );
    if (validValues.length > 0) {
      setValue(name, validValues, { shouldValidate: true });
    }
  }, [data, currentValue, setValue]);

  return (
    <Inputs.FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Inputs.FormItem className="max-w-lg">
          <Inputs.FormLabel className="font-semibold block">
            Subtype <Inputs.RequiredIndicator />
          </Inputs.FormLabel>
          <p className="text-gray-500 max-w-3xl">
            You may select more than one
          </p>
          <Select
            isMulti
            isDisabled={!currentValue.length}
            value={options.filter((option) =>
              field.value?.includes(option.value),
            )}
            onChange={(val) =>
              field.onChange(val.map((v: SelectOption) => v.value))
            }
            options={options}
            closeMenuOnSelect={false}
            className="border border-black shadow-sm rounded-sm"
            placeholder="Select a type to see options"
          />
        </Inputs.FormItem>
      )}
    />
  );
}
