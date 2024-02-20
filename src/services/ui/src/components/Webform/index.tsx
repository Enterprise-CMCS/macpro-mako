import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  RHFDocument,
  SubNavHeader,
  documentInitializer,
  documentValidator,
  LoadingSpinner,
  Link,
  useParams,
} from "@/components";
import { Footer } from "./footer";
import { useGetAllForms, useGetForm } from "@/api";
import { useReadOnlyUser } from "./useReadOnlyUser";
import { FormSchema } from "shared-types";

export const Webforms = () => {
  const { data, isLoading } = useGetAllForms();

  if (isLoading) {
    return <LoadingSpinner />;
  }
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Webforms</h1>
      </SubNavHeader>
      <section className="block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
        <div>
          <table className="table-auto">
            <thead>
              <tr>
                <th>Form</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody>
              {data &&
                Object.entries(data).map(([key, versions]) =>
                  versions.map((version) => (
                    <tr key={`${key}-${version}`}>
                      <td>{key}</td>
                      <td>{version}</td>
                      <td>
                        <Link
                          className="cursor-pointer text-blue-600"
                          path="/webform/:id/:version"
                          params={{ id: key.toLowerCase(), version: version }}
                        >
                          link
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>

          <div className="mt-2">
            <Link
              className="cursor-pointer text-blue-600 ml-0"
              path="/guides/abp"
            >
              Implementation Guide
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

interface WebformBodyProps {
  id: string;
  version: string;
  data: FormSchema;
  readonly: boolean;
  values: any;
}

function WebformBody({
  version,
  id,
  data,
  values,
  readonly,
}: WebformBodyProps) {
  const form = useForm({
    defaultValues: values,
  });
  const [subData, setSubData] = useState("");

  const onSave = () => {
    const values = form.getValues();
    localStorage.setItem(`${id}v${version}`, JSON.stringify(values));
    alert("Saved");
  };

  const reset = () => {
    setSubData("");
    form.reset(documentInitializer(data));
    localStorage.removeItem(`${id}v${version}`);
    alert("Data Cleared");
  };

  const onSubmit = form.handleSubmit(
    (draft) => {
      console.log({ draft });
      setSubData(JSON.stringify(draft, undefined, 2));
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

  return (
    <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <fieldset disabled={readonly}>
            <RHFDocument document={data} {...form} />
            {!readonly && (
              <div className="flex justify-between text-blue-700 underline my-2">
                <div>
                  <Button type="button" onClick={onSave} variant="ghost">
                    Save draft
                  </Button>
                  <Button
                    type="button"
                    onClick={reset}
                    variant="outline"
                    className="mx-2"
                  >
                    Clear Data
                  </Button>
                </div>
                <Button type="submit">Submit</Button>
              </div>
            )}
          </fieldset>
        </form>
      </Form>
      {subData && <pre className="my-2 text-sm">{subData}</pre>}
      <Footer />
    </div>
  );
}

export function Webform() {
  const { id, version } = useParams("/webform/:id/:version");

  const { data, isLoading, error } = useGetForm(id as string, version);
  const readonly = useReadOnlyUser();
  const defaultValues = data ? documentInitializer(data) : {};
  const savedData = localStorage.getItem(`${id}v${version}`);

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
        {`There was an error loading ${id}`}
      </div>
    );
  }

  return (
    <WebformBody
      data={data}
      readonly={readonly}
      id={id}
      version={version}
      values={savedData ? JSON.parse(savedData) : defaultValues}
    />
  );
}
