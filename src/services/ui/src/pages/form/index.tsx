import { useForm } from "react-hook-form";
import { Button, Form } from "@/components/Inputs";
import { RHFDocument } from "@/components/RHF";
import { ABP1 } from "./proto";
import { documentInitializer, documentValidator } from "@/components/RHF/utils";
import { Link, useParams } from "react-router-dom";
import { SubNavHeader } from "@/components";

export const Webforms = () => {
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Webforms</h1>
      </SubNavHeader>
      <section className="block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
        <div className="flex-1">
          <Link to="/webform/abp1/1.0">ABP1 1.0</Link>
        </div>
      </section>
    </>
  );
};

export function Webform() {
  const { id, version } = useParams<{
    id: string;
    version: string;
  }>();
  const defaultValues = documentInitializer(ABP1);

  const savedData = localStorage.getItem(`${id}v${version}`);
  const form = useForm({
    defaultValues: savedData ? JSON.parse(savedData) : defaultValues,
  });

  const onSave = () => {
    const values = form.getValues();
    localStorage.setItem(`${id}v${version}`, JSON.stringify(values));
    alert("Saved");
  };

  const onSubmit = form.handleSubmit(
    (data) => {
      console.log({ data });
      // const validate = documentValidator(ABP1);
      // const isValid = validate(data);
      // console.log({ isValid });
    },
    (err) => {
      console.log({ err });
    }
  );
  return (
    <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <RHFDocument document={ABP1} {...form} />
          <div className="flex justify-between text-blue-700 underline">
            <Button type="button" onClick={onSave} variant="ghost">
              Save draft
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export * from "./medicaid-form";
