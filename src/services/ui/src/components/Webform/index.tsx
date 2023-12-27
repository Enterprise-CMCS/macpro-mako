import { useForm } from "react-hook-form";
import { Button, Form } from "@/components/Inputs";
import { RHFDocument } from "@/components/RHF";
import { Link, useParams } from "react-router-dom";
import { SubNavHeader } from "@/components";
import { documentInitializer, documentValidator } from "@/components/RHF/utils";
import { useGetForm } from "@/api";
import { LoadingSpinner } from "@/components";
import { Footer } from "./footer";
export const Webforms = () => {
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Webforms</h1>
      </SubNavHeader>
      <section className="block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
        <div className="flex-1 space-x-5">
          <Link to="/webform/abp1/1">ABP1</Link>
          <Link to="/guides">Implementation Guide</Link>
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
  const { data, isLoading, error } = useGetForm(id as string, version);

  const defaultValues = data ? documentInitializer(data) : {};
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
    (draft) => {
      console.log({ draft });
      /**
       * The validator is intended to be a replica of RHF validation.
       * To be used in backend api handlers to validate incoming/outgoing form data against document when...
       * - creating/saving form data
       * - retrieving form data
       */
      const validate = documentValidator(data as any);
      const isValid = validate(draft);
      console.log({ isValid });
    },
    (err) => {
      console.log({ err });
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
        {`There was an error loading ${id}`}
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <RHFDocument document={data} {...form} />
          <div className="flex justify-between text-blue-700 underline">
            <Button type="button" onClick={onSave} variant="ghost">
              Save draft
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
      <Footer />
    </div>
  );
}
