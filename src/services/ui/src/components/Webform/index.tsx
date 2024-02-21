/* eslint-disable react/prop-types */
import { useForm } from "react-hook-form";
import { Button, Form } from "@/components/Inputs";
import { RHFDocument } from "@/components/RHF";
import { SubNavHeader } from "@/components";
import { documentInitializer, documentValidator } from "@/components/RHF/utils";
import { useGetForm } from "@/api";
import { LoadingSpinner } from "@/components";
import { Footer } from "./footer";
import { Link, useParams } from "../Routing";
import { useReadOnlyUser } from "./useReadOnlyUser";
import { useLDClient } from "launchdarkly-react-client-sdk";
import { featureFlags } from "shared-utils";
import { useState } from "react";
import { FormSchema } from "shared-types";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";

export const Webforms = () => {
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Webforms</h1>
      </SubNavHeader>
      <section className="block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
        <div className="flex-1 space-x-5">
          <MaintenanceBanner />
          <Link
            path="/webform/:id/:version"
            params={{ id: "abp1", version: 202401 }}
          >
            ABP 1 (Jan 2024)
          </Link>
          <Link
            path="/webform/:id/:version"
            params={{ id: "abp1", version: 202402 }}
          >
            ABP 1 (Feb 2024)
          </Link>
          <Link
            path="/webform/:id/:version"
            params={{ id: "abp3", version: 202401 }}
          >
            ABP 3
          </Link>
          <Link
            path="/webform/:id/:version"
            params={{ id: "abp3_1", version: 202401 }}
          >
            ABP 3.1
          </Link>
          <Link
            path="/webform/:id/:version"
            params={{ id: "abp10", version: 202401 }}
          >
            ABP 10
          </Link>
          <Link path="/guides/abp">Implementation Guide</Link>
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
                  <ClearDataButton reset={reset} />
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

const ClearDataButton: React.FC<{ reset: () => void }> = ({ reset }) => {
  const ldClient = useLDClient();
  const clearDataButton: string = ldClient?.variation(
    featureFlags.CLEAR_DATA_BUTTON.flag,
    featureFlags.CLEAR_DATA_BUTTON.defaultValue
  );

  if (clearDataButton) {
    return (
      <Button type="button" onClick={reset} variant="outline" className="mx-2">
        Clear Data
      </Button>
    );
  }
  return null;
};
