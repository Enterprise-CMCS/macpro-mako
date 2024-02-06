import { Alert } from "@/components";
import {
  Button,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RequiredIndicator,
  Textarea,
  Upload,
} from "@/components/Inputs";
import { FAQ_TAB } from "@/components/Routing/consts";
import { Info } from "lucide-react";
import { FieldValues, SubmitHandler, useFormContext } from "react-hook-form";
import {
  Link,
  useNavigation,
  useRouteError,
  useSubmit,
} from "react-router-dom";

export const RequiredFieldDescription = () => {
  return (
    <p>
      <span className="text-red-500">*</span> Indicates a required field
    </p>
  );
};

export const ActionDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <p className="font-light mb-6 max-w-4xl">{children}</p>;
};

export const Heading = ({ title }: { title: string }) => {
  return <h1 className="text-2xl font-semibold mt-4 mb-2">{title}</h1>;
};

export const AttachmentsSection = ({
  attachments,
}: {
  attachments: { name: string; required: boolean }[];
}) => {
  return (
    <>
      <h2 className="font-bold text-2xl font-sans mb-2">Attachments</h2>
      <p>
        Maximum file size of 80 MB per attachment.{" "}
        <strong>You can add multiple files per attachment type.</strong> Read
        the description for each of the attachment types on the{" "}
        <Link
          className="text-blue-700 hover:underline"
          to={"/faq/#medicaid-spa-rai-attachments"}
          target={FAQ_TAB}
        >
          {" "}
          FAQ Page.
        </Link>
      </p>
      <p>
        We accept the following file formats:{" "}
        <strong>.docx, .jpg, .png, .pdf, .xlsx,</strong>
        and a few others. See the full list on the FAQ Page.
      </p>
      {attachments.map(({ name, required }) => (
        <FormItem key={name} className="my-4 space-y-2">
          <FormLabel>{name}</FormLabel> {required && <RequiredIndicator />}
          <Upload files={[]} setFiles={() => []} />
        </FormItem>
      ))}
    </>
  );
};

export const SubmissionButtons = () => {
  const { state } = useNavigation();

  return (
    <section className="space-x-2 mb-8">
      <Button type="submit" disabled={state === "submitting"}>
        Submit
      </Button>
      <Button
        variant={"outline"}
        type="reset"
        disabled={state === "submitting"}
      >
        Cancel
      </Button>
    </section>
  );
};

export const PackageSection = ({ id, type }: { id: string; type: string }) => {
  return (
    <section className="flex flex-col my-8 space-y-8">
      <div>
        <p>Package ID</p>
        <p className="text-xl">{id}</p>
      </div>
      <div>
        <p>Type</p>
        <p className="text-xl">{type}</p>
      </div>
    </section>
  );
};

export const AdditionalInformation = () => {
  const form = useFormContext();

  return (
    <section className="my-4">
      <h2 className="font-bold text-2xl font-sans mb-2">
        Additional Information <RequiredIndicator />
      </h2>
      <FormField
        control={form.control}
        name="additionalInformation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <p>
                Add anything else that you would like to share with the State.
              </p>
            </FormLabel>
            <Textarea {...field} className="h-[200px] resize-none" />
            <FormMessage />
            <FormDescription>4,000 characters allowed</FormDescription>
          </FormItem>
        )}
      />
    </section>
  );
};

export const useSubmitForm = () => {
  const methods = useFormContext();
  const submit = useSubmit();

  const validSubmission: SubmitHandler<FieldValues> = (data, e) => {
    e?.preventDefault();
    submit(data, {
      method: "post",
    });
  };

  return { handleSubmit: methods.handleSubmit(validSubmission) };
};
