import { useGetTypes } from "@/api";
import * as Inputs from "@/components/Inputs";
import { useFormContext } from "react-hook-form";
import Select from "react-select";
import { useSeaToolAuthorityId } from "@/utils/useSeaToolAuthorityId";
import { LoadingSpinner } from "@/components";

type SelectOption = {
  value: number;
  label: string;
};

export function TypeSelect() {
  const authorityId = useSeaToolAuthorityId();
  const { data, isLoading } = useGetTypes(authorityId);
  const form = useFormContext();

  const options = data?.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  if (isLoading) return <LoadingSpinner />;
  return (
    <Inputs.FormField
      control={form.control}
      name={"typeIds"}
      render={({ field }) => {
        return (
          <Inputs.FormItem className="mb-8 max-w-lg">
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
