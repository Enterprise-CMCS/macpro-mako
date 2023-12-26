import { Navigate, useNavigate, useParams } from "@/components/Routing";
import { Button } from "@/components/Inputs";
import { ConfirmationModal } from "@/components/Modal/ConfirmationModal";
import { useState } from "react";
import { PlanType, ItemResult } from "shared-types";
import { ROUTES } from "@/routes";
import { PackageActionForm } from "./PackageActionForm";
import { ActionFormIntro, PackageInfo } from "./common";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as I from "@/components/Inputs";
import { LoadingSpinner } from "@/components";
import { AttachmentRecipe, buildActionUrl } from "@/lib";
import { useGetUser } from "@/api/useGetUser";
import { submit } from "@/api/submissionService";
import { AttachmentsSizeTypesDesc } from "@/pages/form/content";

// Temporary, will be refactored to an extendable schema with Brian/Mike's back-end
// work.
const withdrawPackageFormSchema = z.object({
  additionalInformation: z
    .string()
    .max(4000, "This field may only be up to 4000 characters.")
    .optional(),
  attachments: z.object({
    supportingDocumentation: z.array(z.instanceof(File)).optional(),
  }),
});
type WithdrawPackageFormSchema = z.infer<typeof withdrawPackageFormSchema>;
const attachments: AttachmentRecipe<WithdrawPackageFormSchema>[] = [
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
  const { id, type } = useParams("/action/:id/:type");
  const { data: user } = useGetUser();
  const authority = item?._source.authority as PlanType;
  const form = useForm<WithdrawPackageFormSchema>({
    resolver: zodResolver(withdrawPackageFormSchema),
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleSubmit: SubmitHandler<WithdrawPackageFormSchema> = async (
    data
  ) => {
    try {
      if (!cancelModalIsOpen) {
        if (
          !data.attachments.supportingDocumentation &&
          !data.additionalInformation
        ) {
          setErrorMessage(
            "An Attachment or Additional Information is required."
          );
        } else {
          await submit<WithdrawPackageFormSchema & { id: string }>({
            data: {
              ...data,
              id: id!, // Declared here because it's not part of the form data.
            },
            endpoint: buildActionUrl(type!),
            user,
            authority,
          });
          setSuccessModalIsOpen(true);
        }
      }
    } catch (err) {
      console.log(err);
      setErrorModalIsOpen(true);
    }
  };

  if (!item) return <Navigate path={"/"} />; // Prevents optional chains below
  return (
    <>
      {form.formState.isSubmitting && <LoadingSpinner />}
      <div>
        <div className="px-14  py-5 ">
          <ActionFormIntro title="Withdraw Medicaid SPA Package">
            <p>
              Complete this form to withdraw a package. Once complete, you will
              not be able to resubmit this package. CMS will be notified and
              will use this content to review your request. If CMS needs any
              additional information, they will follow up by email.
            </p>
          </ActionFormIntro>
          <PackageInfo item={item} />
          <I.Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              {/* Change faqLink once we know the anchor */}
              <AttachmentsSizeTypesDesc faqLink={ROUTES.FAQ} />
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
                      Explain your need for withdrawal or upload supporting
                      documentation.
                      <br />
                      <p>
                        <em className="italic">
                          Once you submit this form, a confirmation email is
                          sent to you and to CMS. CMS will use this content to
                          review your package. If CMS needs any additional
                          information, they will follow up by email.
                        </em>{" "}
                      </p>
                      <br />
                    </I.FormLabel>
                    <I.Textarea {...field} className="h-[200px] resize-none" />
                    <I.FormDescription>
                      4,000 characters allowed
                    </I.FormDescription>
                  </I.FormItem>
                )}
              />
              {errorMessage && (
                <div className="text-red-500 mt-4">{errorMessage}</div>
              )}
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
            navigate({ path: "/details", query: { id } });
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
            navigate({ path: "/details", query: { id } });
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
            navigate({ path: "/details", query: { id } });
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
