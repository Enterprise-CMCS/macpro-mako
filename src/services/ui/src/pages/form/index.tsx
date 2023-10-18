import { ajvResolver } from "@hookform/resolvers/ajv";
import { useForm } from "react-hook-form";
import { Button, Form } from "@/components/Inputs";

import { RHFDocument } from "@/components/RHF";
import { ABP1 } from "./proto";

export const JsonFormSchema = {
  type: "object",
  properties: {
    alt_benefit_plan_population_name: {
      type: "string",
      minLength: 1,
      maxLength: 20,
      errorMessage: {
        minLength: "This field is required",
      },
    },
    is_enrollment_available: {
      type: "string",
    },
  },
  required: ["alt_benefit_plan_population_name"],
  additionalProperties: true,
};

export function ExampleForm() {
  const form = useForm({
    resolver: ajvResolver(JsonFormSchema as any),
    defaultValues: {
      alt_benefit_plan_population_name: "",
      eligibility_groups: [],
      is_enrollment_available: "no",
      target_criteria: [],
      income_target: "",
      income_definition: "",
      income_definition_specific: "",
      income_definition_specific_statewide: [],
      is_incremental_amount: false,
      dollar_incremental_amount: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    console.log(data);
  });

  return (
    <div className="max-w-screen-xl mx-auto p-4 lg:px-8">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <RHFDocument document={ABP1} {...form} />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
