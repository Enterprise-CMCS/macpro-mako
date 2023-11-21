import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/Inputs";
import { ConfirmationModal } from "@/components/Modal/ConfirmationModal";
import { useEffect, useState } from "react";
import { ItemResult } from "shared-types";
import { FAQ_TARGET, ROUTES } from "@/routes";
import { PackageActionForm } from "./PackageActionForm";
import { ActionFormIntro, PackageInfo } from "./common";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as I from "@/components/Inputs";
import { Link } from "react-router-dom";
import { useWithdrawPackage } from "@/api/useWithdrawPackage";
import { Alert, LoadingSpinner } from "@/components";
import {
  WithdrawPackageSchema,
  withdrawPackageEventSchema,
} from "shared-types";

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
  const { id } = useParams<{ id: string }>();
  const form = useForm<WithdrawPackageSchema>({
    resolver: zodResolver(withdrawPackageEventSchema),
  });
  const { mutate, isLoading, isSuccess, error } = useWithdrawPackage(id!);

  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isSuccess) setSuccessModalOpen(true);
  }, [isSuccess]);

  if (!item) return <Navigate to={ROUTES.DASHBOARD} />; // Prevents optional chains below
  return (
    <>
      {isLoading && <LoadingSpinner />}
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
              {error && (
                <Alert className="mb-4 max-w-2xl" variant="destructive">
                  <strong>ERROR Withdrawing Package: </strong>
                  {error.response.data.message}
                </Alert>
              )}
              <div className="flex gap-2 my-8">
                <Button onClickCapture={() => mutate()} type="submit">
                  Submit
                </Button>
                <Button
                  onClick={() => setCancelModalOpen(true)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </I.Form>
        </div>
        {/* Success Modal */}
        <ConfirmationModal
          open={successModalOpen}
          onAccept={() => {
            setSuccessModalOpen(false);
            navigate(`/details?id=${id}`);
          }}
          onCancel={() => setSuccessModalOpen(false)} // Should be made optional
          title="Withdraw Successful"
          body={
            <p>
              Please be aware that it may take up to a minute for your status to
              change on the Dashboard and Details pages.
            </p>
          }
          cancelButtonVisible={false}
          acceptButtonText="Go to Package Details"
        />

        {/* Cancel Modal */}
        <ConfirmationModal
          open={cancelModalOpen}
          onAccept={() => {
            setCancelModalOpen(false);
            navigate(`/details?id=${id}`);
          }}
          onCancel={() => setCancelModalOpen(false)}
          cancelButtonText="Return to Form"
          acceptButtonText="Leave Page"
          title="Are you sure you want to cancel?"
          body={
            <p>
              If you leave this page you will lose your progress on this form
            </p>
          }
        />
      </div>
    </>
  );
};

export const WithdrawPackage = () => (
  <PackageActionForm>
    <WithdrawPackageForm />
  </PackageActionForm>
);
