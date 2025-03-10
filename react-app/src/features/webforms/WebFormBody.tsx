import { FC } from "react";
import { Button, Form } from "@/components";
import { WebformFooter } from "../webforms/WebformFooter";
import { FormSchema } from "shared-types";
import { documentValidator, RHFDocument } from "../../components/RHF";
import { useWebform } from "../webforms";
import { useLDClient } from "launchdarkly-react-client-sdk";
import { featureFlags } from "shared-utils";

interface WebformBodyProps {
  id: string;
  version: string;
  data: FormSchema;
  readonly: boolean;
  values: Record<any, any>;
}

const trimData = (data) => {
  if (typeof data === "string") {
    return data.trim();
  }
  if (Array.isArray(data)) {
    return data.map(trimData);
  }
  if (typeof data === "object" && data !== null) {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = trimData(data[key]);
      return acc;
    }, {});
  }
  return data;
};

export function WebformBody({ version, id, data, values, readonly }: WebformBodyProps) {
  const { form, onSave, reset, subData, setSubData } = useWebform({
    values,
    id,
    version,
    data,
  });

  const onSubmit = form.handleSubmit(
    (draft) => {
      setSubData(JSON.stringify(trimData(draft), undefined, 2));
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
      console.error({ err });
    },
  );

  return (
    <div className="max-w-screen-lg mx-auto p-4 py-8 lg:px-8">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <fieldset disabled={readonly} className="min-w-full">
            <RHFDocument document={data} {...form} />
            {!readonly && (
              <div className="flex justify-between text-blue-700 underline mb-2 mt-10">
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
      <WebformFooter />
    </div>
  );
}

const ClearDataButton: FC<{ reset: () => void }> = ({ reset }) => {
  const ldClient = useLDClient();
  const clearDataButton: string = ldClient?.variation(
    featureFlags.CLEAR_DATA_BUTTON.flag,
    featureFlags.CLEAR_DATA_BUTTON.defaultValue,
  );

  if (clearDataButton) {
    return (
      <Button type="button" onClick={reset} variant="outline" className="mx-2">
        Clear
      </Button>
    );
  }
  return null;
};
