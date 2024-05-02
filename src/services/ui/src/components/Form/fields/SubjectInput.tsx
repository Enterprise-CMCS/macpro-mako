import * as Inputs from "@/components/Inputs";
import { useFormContext } from "react-hook-form";
import { useParams } from "react-router-dom";

export function SubjectInput() {
  const form = useFormContext();
  const { authority } = useParams();
  return (
    <Inputs.FormField
      control={form.control}
      name={"subject"}
      render={({ field }) => (
        <Inputs.FormItem className="mb-8 max-w-sm">
          <Inputs.FormLabel className="font-semibold block">
            Subject <Inputs.RequiredIndicator />
          </Inputs.FormLabel>
          <p className="text-gray-500">
            The title or purpose of the {authority}
          </p>
          <Inputs.FormControl>
            <Inputs.Input {...field} value={field.value || ""} />
          </Inputs.FormControl>
          <Inputs.FormMessage />
        </Inputs.FormItem>
      )}
    />
  );
}
