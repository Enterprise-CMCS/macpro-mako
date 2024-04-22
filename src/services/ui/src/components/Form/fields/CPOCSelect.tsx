import { useGetCPOCs } from "@/api";
import * as Inputs from "@/components/Inputs";
import { useFormContext } from "react-hook-form";
import Select from "react-select";
import { cpocs } from "shared-types/opensearch";

export function CPOCSelect() {
  const { data } = useGetCPOCs<cpocs.Document>();
  const form = useFormContext();

  const options = data
    ? data?.map((item) => ({
        value: item.id,
        label: `${item.lastName}, ${item.firstName}`,
      }))
    : [];

  return (
    <Inputs.FormField
      control={form.control}
      name={"cpoc"}
      render={({ field }) => {
        return (
          <Inputs.FormItem className="mb-8 max-w-lg">
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
