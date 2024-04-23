import * as Inputs from "@/components/Inputs";
import { useFormContext } from "react-hook-form";

export const NewIdField = () => {
  const form = useFormContext();
  return (
    <Inputs.FormField
      control={form.control}
      name="newId"
      render={({ field }) => (
        <Inputs.FormItem className={"mb-8"}>
          <div className="flex gap-4">
            <Inputs.FormLabel className="font-semibold">
              New ID <Inputs.RequiredIndicator />
            </Inputs.FormLabel>
          </div>
          <Inputs.FormControl>
            <Inputs.Input
              className="max-w-sm"
              {...field}
              onInput={(e) => {
                if (e.target instanceof HTMLInputElement) {
                  e.target.value = e.target.value.toUpperCase();
                }
              }}
            />
          </Inputs.FormControl>
          <Inputs.FormMessage />
        </Inputs.FormItem>
      )}
    />
  );
};
