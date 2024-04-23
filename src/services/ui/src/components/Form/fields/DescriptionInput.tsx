import * as Inputs from "@/components/Inputs";
import { useFormContext } from "react-hook-form";
import { useParams } from "react-router-dom";

export function DescriptionInput() {
  const form = useFormContext();
  const { authority } = useParams();
  return (
    <Inputs.FormField
      control={form.control}
      name={"description"}
      render={({ field }) => (
        <Inputs.FormItem className={"mb-8"}>
          <Inputs.FormLabel className="font-semibold block">
            Description <Inputs.RequiredIndicator />
          </Inputs.FormLabel>
          <p className="text-gray-500 max-w-3xl">
            A summary of the ${authority}. This should include details about a
            reduction or increase, the amount of the reduction or increase,
            Federal Budget impact, and fiscal year. If there is a reduction,
            indicate if the EPSDT population is or isn’t exempt from the
            reduction.
          </p>
          <Inputs.Textarea
            {...field}
            className="h-[100px] resize-none max-w-lg"
          />
          <Inputs.FormMessage />
        </Inputs.FormItem>
      )}
    />
  );
}
