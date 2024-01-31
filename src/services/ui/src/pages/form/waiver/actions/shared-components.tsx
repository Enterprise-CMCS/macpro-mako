import {
  Button,
  FormItem,
  FormLabel,
  RequiredIndicator,
  Upload,
} from "@/components/Inputs";
import { FAQ_TAB } from "@/components/Routing/consts";
import { Link } from "react-router-dom";

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
  return (
    <section className="space-x-2 mb-8">
      <Button type="submit">Submit</Button>
      <Button variant={"outline"} type="reset">
        Cancel
      </Button>
    </section>
  );
};
