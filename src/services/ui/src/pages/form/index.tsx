import { useForm } from "react-hook-form";
import { Button, Form } from "@/components/Inputs";
import { useGetForm } from "@/api/useGetForm";
import { RHFDocument } from "@/components/RHF";
import { ABP1 } from "./proto";
import { documentInitializer } from "@/components/RHF";

export function ExampleForm() {
  const defaultValues = documentInitializer(ABP1);

  const form = useForm({
    defaultValues,
  });

  const onSubmit = form.handleSubmit(
    (data) => {
      console.log({ data });
    },
    (err) => {
      console.log({ err });
    }
  );

  const { data, isLoading, error } = useGetForm("testform");
  console.info(data, isLoading, error);

  return (
    <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
      {isLoading}

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <RHFDocument document={ABP1} {...form} />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
