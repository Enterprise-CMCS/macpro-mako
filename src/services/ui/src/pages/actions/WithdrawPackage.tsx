import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Button, Input } from "@/components/Inputs";
import { Modal } from "@/components/Modal";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ItemResult } from "shared-types";
import { FAQ_TARGET, ROUTES } from "@/routes";
import { PackageActionForm } from "./PackageActionForm";
import { ActionFormIntro, PackageInfo } from "./common";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as I from "@/components/Inputs";
import { Link } from "react-router-dom";

const schema = z.object({
  id: z.string(),
  additionalInformation: z
    .string()
    .max(4000, "This field may only be up to 4000 characters.")
    .optional(),
  attachments: z.object({
    supportingDocumentation: z.array(z.instanceof(File)).optional(),
  }),
});
type WithdrawPackageSchema = z.infer<typeof schema>;
type UploadKey = keyof WithdrawPackageSchema["attachments"];
type AttachmentRecipe = {
  readonly name: UploadKey;
  readonly label: string;
  readonly required: boolean;
};

const attachments: AttachmentRecipe[] = [
  {
    name: "supportingDocumentation",
    label: "Supporting Documentation",
    required: false,
  },
];

const handler: SubmitHandler<WithdrawPackageSchema> = (data) =>
  console.log(data);

const WithdrawPackageForm: React.FC = ({ item }: { item?: ItemResult }) => {
  const navigate = useNavigate();
  const form = useForm<WithdrawPackageSchema>({
    resolver: zodResolver(schema),
  });
  const [withdrawModal, setModalWithdraw] = useState<boolean>(false);
  const [withdrawData, setwithdrawData] = useState<{
    withdraw_document?: any;
    withdraw_comment?: string;
  }>({
    withdraw_document: null,
    withdraw_comment: "",
  });
  const navigateBack = (): void => {
    navigate(-1);
  };
  const { id } = useParams<{
    id: string;
    type: string;
  }>();

  const onHandleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = event.target;
    if (event.target.files && event.target.files[0]) {
      setwithdrawData({ ...withdrawData, withdraw_document: files });
    } else if (name === "withdraw_comment") {
      setwithdrawData({ ...withdrawData, withdraw_comment: value });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
  };

  if (!item) return <Navigate to={ROUTES.DASHBOARD} />; // Prevents optional chains below

  return (
    <>
      <div>
        <div className="px-14  py-5 ">
          <ActionFormIntro title="WithDraw Medicaid SPA Package">
            <p>
              Complete this form to withdrawn a package. Once complete you will
              not be able to resubmit tis package.CMS will be notified and will
              use this content to review your request. if CMS needs any
              additional information.they will follow up by email
            </p>
          </ActionFormIntro>
          <PackageInfo item={item} />
          <I.Form {...form}>
            <form onSubmit={form.handleSubmit(handler)}>
              <section>
                <h3 className="text-2xl font-bold font-sans">Attachments</h3>
                <p>
                  Maximum file size of 80 MB per attachment.{" "}
                  <strong>
                    You can add multiple files per attachment type.
                  </strong>{" "}
                  Read the description for each of the attachment types on the{" "}
                  {
                    <Link
                      to="/faq/#medicaid-spa-attachments"
                      target={FAQ_TARGET}
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      FAQ Page
                    </Link>
                  }
                  .
                </p>
                <br />
                <p>
                  We accept the following file formats:{" "}
                  <strong className="bold">
                    .docx, .jpg, .png, .pdf, .xlsx,
                  </strong>{" "}
                  and a few others. See the full list on the{" "}
                  {
                    <Link
                      to="/faq/#acceptable-file-formats"
                      target={FAQ_TARGET}
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      FAQ Page
                    </Link>
                  }
                  .
                </p>
                <br />
                <p>
                  <I.RequiredIndicator />
                  At least one attachment is required.
                </p>
              </section>
              {attachments.map(({ name, label, required }) => (
                <I.FormField
                  key={name}
                  control={form.control}
                  name={`attachments.${name}`}
                  render={({ field }) => (
                    <I.FormItem className="mt-8">
                      <I.FormLabel>
                        {label}
                        {required ? <I.RequiredIndicator /> : ""}
                      </I.FormLabel>
                      <I.Upload
                        files={field?.value ?? []}
                        setFiles={field.onChange}
                      />
                      <I.FormMessage />
                    </I.FormItem>
                  )}
                />
              ))}
              <I.FormField
                control={form.control}
                name="additionalInformation"
                render={({ field }) => (
                  <I.FormItem className="mt-8">
                    <h3 className="font-bold text-2xl font-sans">
                      Additional Information
                    </h3>
                    <I.FormLabel className="font-normal">
                      Add anything else you would like to share with CMS,
                      limited to 4000 characters
                    </I.FormLabel>
                    <I.Textarea {...field} className="h-[200px] resize-none" />
                    <I.FormDescription>
                      4,000 characters allowed
                    </I.FormDescription>
                  </I.FormItem>
                )}
              />
              <div className="flex gap-2 my-8">
                <Button type="submit">Submit</Button>
                <Button onClick={() => navigate(-1)} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </I.Form>
        </div>
        <div></div>
      </div>
    </>
  );
};

export const WithdrawPackage = () => (
  <PackageActionForm>
    <WithdrawPackageForm />
  </PackageActionForm>
);
