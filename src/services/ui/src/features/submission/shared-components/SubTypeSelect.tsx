import { useEffect, useMemo } from "react";
import { useGetSubTypes } from "@/api";
import * as Inputs from "@/components/Inputs";
import { useFormContext, useWatch } from "react-hook-form";
import Select from "react-select";
import { uniqBy } from "lodash";

type SubTypeSelectFormFieldProps = {
  authorityId: number;
};
type SelectOption = {
  value: number;
  label: string;
};

export function SubTypeSelect({ authorityId }: SubTypeSelectFormFieldProps) {
  const { control, setValue } = useFormContext();
  const typeIds = useWatch({ name: "typeIds", defaultValue: [] });
  const subTypeIds = useWatch({
    name: "subTypeIds",
    defaultValue: [],
  });

  const { data } = useGetSubTypes(authorityId, typeIds);

  const options = useMemo(
    () =>
      uniqBy(data, "name").map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [data],
  );

  useEffect(() => {
    const validValues = typeIds?.filter((val: number) =>
      options.find((option) => option.value === val),
    );

    if (validValues.length > 0) {
      setValue("subTypeIds", validValues, { shouldValidate: true });
    }
    if (typeIds.length === 0) {
      setValue("subTypeIds", []);
    }
  }, [options, typeIds, data]);

  return (
    <Inputs.FormField
      control={control}
      name={"subTypeIds"}
      render={() => (
        <Inputs.FormItem className="max-w-lg">
          <Inputs.FormLabel className="font-semibold block">
            Subtype <Inputs.RequiredIndicator />
          </Inputs.FormLabel>
          <p className="text-gray-500 max-w-3xl">
            You may select more than one
          </p>
          <Select
            isMulti
            isDisabled={!typeIds.length}
            value={options.filter((option) =>
              subTypeIds?.includes(option.value),
            )}
            onChange={(val) => {
              if (val.length === 0) {
                setValue("subTypeIds", [], { shouldValidate: true });
                return;
              }
              const v = val.map((v: SelectOption) => v.value);
              setValue("subTypeIds", v, { shouldValidate: true });
            }}
            options={options}
            closeMenuOnSelect={false}
            className="border border-black shadow-sm rounded-sm"
            placeholder="Select a type to see options"
          />
          <Inputs.FormMessage />
        </Inputs.FormItem>
      )}
    />
  );
}
