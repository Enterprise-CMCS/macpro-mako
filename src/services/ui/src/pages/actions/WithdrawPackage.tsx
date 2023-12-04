import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/Inputs";
import { ConfirmationModal } from "@/components/Modal/ConfirmationModal";
import { useState } from "react";
import { Action, ItemResult, withdrawPackageSchema } from "shared-types";
import { FAQ_TARGET, ROUTES } from "@/routes";
import { PackageActionForm } from "./PackageActionForm";
import { ActionFormIntro, PackageInfo } from "./common";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as I from "@/components/Inputs";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "@/components";
import { buildActionUrl } from "@/lib";
import { useGetUser } from "@/api/useGetUser";
import { submit } from "@/api/submissionService";

const withdrawPackageFormSchema = withdrawPackageSchema(
  z.array(z.instanceof(File))
);
type WithdrawPackageFormSchema = z.infer<typeof withdrawPackageFormSchema>;
type UploadKey = keyof WithdrawPackageFormSchema["attachments"];
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
  } as const,
];

const WithdrawPackageForm: React.FC = ({ item }: { item?: ItemResult }) => {
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const { id, type } = useParams<{ id: string; type: Action }>();
  const { data: user } = useGetUser();
  const form = useForm<WithdrawPackageFormSchema>({
    resolver: zodResolver(withdrawPackageFormSchema),
  });

  const handleSubmit: SubmitHandler<WithdrawPackageFormSchema> = async (
    data
  ) => {
    try {
      await submit<WithdrawPackageFormSchema & { id: string }>({
        data: {
          id: id!, // Declared here because it's not part of the form data
          ...data,
        },
        endpoint: buildActionUrl(type!),
        user,
      });
      setSuccessModalIsOpen(true);
    } catch (err) {
      console.log(err);
      setErrorModalIsOpen(true);
    }
  };

  if (!item) return <Navigate to={ROUTES.DASHBOARD} />; // Prevents optional chains below
  return (
    <>
      {form.formState.isSubmitting && <LoadingSpinner />}
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
            <form onSubmit={form.handleSubmit(handleSubmit)}>
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
                <Button
                  onClick={() => setCancelModalIsOpen(true)}
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
          open={successModalIsOpen}
          onAccept={() => {
            setSuccessModalIsOpen(false);
            navigate(`/details?id=${id}`);
          }}
          onCancel={() => setSuccessModalIsOpen(false)} // Should be made optional
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
        {/* Error Modal */}
        <ConfirmationModal
          open={errorModalIsOpen}
          onAccept={() => {
            setErrorModalIsOpen(false);
            navigate(`/details?id=${id}`);
          }}
          onCancel={() => setErrorModalIsOpen(false)}
          title="Submission Error"
          body={
            <p>
              An error occurred during issue.
              <br />
              You may close this window and try again, however, this likely
              requires support.
              <br />
              <br />
              Please contact the{" "}
              <a
                href="mailto:OneMAC_Helpdesk@cms.hhs.gov"
                className="text-blue-500"
              >
                helpdesk
              </a>{" "}
              . You may include the following in your support request: <br />
              <br />
              <ul>
                <li>SPA ID: {id}</li>
                <li>Timestamp: {Date.now()}</li>
              </ul>
            </p>
          }
          cancelButtonVisible={true}
          cancelButtonText="Return to Form"
          acceptButtonText="Exit to Package Details"
        />
        {/* Cancel Modal */}
        <ConfirmationModal
          open={cancelModalIsOpen}
          onAccept={() => {
            setCancelModalIsOpen(false);
            navigate(`/details?id=${id}`);
          }}
          onCancel={() => setCancelModalIsOpen(false)}
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
