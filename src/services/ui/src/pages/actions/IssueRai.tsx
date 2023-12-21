import { useParams } from "react-router-dom";
import * as I from "@/components/Inputs";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DETAILS_AND_ACTIONS_CRUMBS } from "@/pages/actions/actions-breadcrumbs";
import {
  SimplePageContainer,
  Alert,
  LoadingSpinner,
  BreadCrumbs,
} from "@/components";
import { ConfirmationModal } from "@/components/Modal/ConfirmationModal";
import { FAQ_TARGET } from "@/routes";
import { Link, useNavigate } from "react-router-dom";
import { Action, PlanType } from "shared-types";
import { useGetUser } from "@/api/useGetUser";
import { useGetItem } from "@/api";
import { submit } from "@/api/submissionService";
import { buildActionUrl } from "@/lib";

const formSchema = z.object({
  additionalInformation: z.string().max(4000),
  attachments: z.object({
    formalRaiLetter: z
      .array(z.instanceof(File))
      .refine((value) => value.length > 0, {
        message: "Required",
      }),
    other: z.array(z.instanceof(File)).optional(),
  }),
});
export type RaiIssueFormSchema = z.infer<typeof formSchema>;

const attachmentList = [
  {
    name: "formalRaiLetter",
    label: "Formal RAI Letter",
    required: true,
  },
  {
    name: "other",
    label: "Other",
    required: false,
  },
] as const;

const FormDescriptionText = () => {
  return (
    <p className="font-light mb-6 max-w-4xl">
      Issuance of a Formal RAI in OneMAC will create a Formal RAI email sent to
      the State. This will also create a section in the package details summary
      for you and the State to have record. Please attach the Formal RAI Letter
      along with any additional information or comments in the provided text
      box. Once you submit this form, a confirmation email is sent to you and to
      the State.{" "}
      <strong className="bold">
        If you leave this page, you will lose your progress on this form.
      </strong>
    </p>
  );
};

export const RaiIssue = () => {
  const { id, type } = useParams<{
    id: string;
    type: Action;
  }>();
  const { data: item } = useGetItem(id!);
  const authority = item?._source.authority as PlanType;
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const form = useForm<RaiIssueFormSchema>({
    resolver: zodResolver(formSchema),
  });
  const { data: user } = useGetUser();
  const handleSubmit: SubmitHandler<RaiIssueFormSchema> = async (data) => {
    try {
      await submit<RaiIssueFormSchema & { id: string }>({
        data: {
          id: id!, // Declared here because it's not part of the form data
          ...data,
        },
        endpoint: buildActionUrl(type!),
        user,
        authority,
      });
      setSuccessModalIsOpen(true);
    } catch (err) {
      console.log(err);
      setErrorModalIsOpen(true);
    }
  };

  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={DETAILS_AND_ACTIONS_CRUMBS({
          id: id || "",
          action: Action.ISSUE_RAI,
        })}
      />
      <I.Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="my-6 space-y-8 mx-auto"
        >
          <section>
            <h1 className="font-bold text-2xl mb-2">Formal RAI Details</h1>
            <p className="my-1">
              <I.RequiredIndicator /> Indicates a required field
            </p>
            <FormDescriptionText />
          </section>
          {/*-------------------------------------------------------- */}
          <section className="grid grid-cols-2">
            <h3 className="text-2xl font-bold font-sans col-span-2">
              Package Details
            </h3>
            <div className="flex flex-col my-8">
              <label>SPA ID</label>
              <span className="text-xl" aria-labelledby="package-id-label">
                {id}
              </span>
            </div>
            <div className="flex flex-col my-8">
              <label>Type</label>
              <span className="text-xl" aria-labelledby="package-id-label">
                {item?._source.planType}
              </span>
            </div>
          </section>
          {/*-------------------------------------------------------- */}
          <section>
            <h3 className="text-2xl font-bold font-sans">Attachments</h3>
            <p>
              Maximum file size of 80 MB per attachment.{" "}
              <strong>You can add multiple files per attachment type.</strong>{" "}
              Read the description for each of the attachment types on the{" "}
              {
                <Link
                  to="/faq/#medicaid-spa-rai-attachments"
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
              <strong className="bold">.docx, .jpg, .png, .pdf, .xlsx,</strong>{" "}
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
          {attachmentList.map(({ name, label, required }) => (
            <I.FormField
              key={name}
              control={form.control}
              name={`attachments.${name}`}
              render={({ field }) => (
                <I.FormItem>
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
          {/*-------------------------------------------------------- */}
          <I.FormField
            control={form.control}
            name="additionalInformation"
            render={({ field }) => (
              <I.FormItem>
                <h3 className="font-bold text-2xl font-sans">
                  Additional Information<span className="text-red-500">*</span>
                </h3>
                <I.FormLabel className="font-normal">
                  Add anything else you would like to share with the state.
                </I.FormLabel>
                <I.Textarea {...field} className="h-[200px] resize-none" />
                <I.FormDescription>4,000 characters allowed</I.FormDescription>
              </I.FormItem>
            )}
          />
          {/*-------------------------------------------------------- */}
          <FormDescriptionText />
          {Object.keys(form.formState.errors).length !== 0 ? (
            <Alert className="mb-6" variant="destructive">
              Missing or malformed information. Please see errors above.
            </Alert>
          ) : null}
          {form.formState.isSubmitting && (
            <div className="p-4">
              <LoadingSpinner />
            </div>
          )}
          <div className="flex gap-2">
            <I.Button
              disabled={form.formState.isSubmitting}
              type="submit"
              className="px-12"
            >
              Submit
            </I.Button>
            <I.Button
              type="button"
              variant="outline"
              onClick={() => setCancelModalIsOpen(true)}
              className="px-12"
            >
              Cancel
            </I.Button>
            <ConfirmationModal
              open={successModalIsOpen}
              onAccept={() => {
                setSuccessModalIsOpen(false);
                navigate(`/details?id=${id}`);
              }}
              onCancel={() => setSuccessModalIsOpen(false)}
              title="The Formal RAI has been issued."
              body={
                <p>
                  The Formal RAI has been issued successfully. You and the State
                  will receive an email confirmation.
                </p>
              }
              cancelButtonVisible={false}
              acceptButtonText="Exit to Package Details"
            />
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
                  . You may include the following in your support request:{" "}
                  <br />
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
            <ConfirmationModal
              open={cancelModalIsOpen}
              onAccept={() => {
                setCancelModalIsOpen(false);
                navigate(`/details?id=${id}`);
              }}
              onCancel={() => setCancelModalIsOpen(false)}
              cancelButtonText="Return to Form"
              acceptButtonText="Yes"
              title="Are you sure you want to cancel?"
              body={
                <p>
                  If you leave this page you will lose your progress on this
                  form
                </p>
              }
            />
          </div>
        </form>
      </I.Form>
    </SimplePageContainer>
  );
};
