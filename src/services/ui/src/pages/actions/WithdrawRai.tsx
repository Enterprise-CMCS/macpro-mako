import {
  ConfirmationModal,
  LoadingSpinner,
  SimplePageContainer,
} from "@/components";
import * as I from "@/components/Inputs";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Authority } from "shared-types";
import { useGetItem } from "@/api/useGetItem";
import { useGetUser } from "@/api/useGetUser";
import { PackageActionForm } from "./PackageActionForm";
import { submit } from "@/api/submissionService";
import { useState } from "react";
import { FAQ_TARGET } from "@/routes";

const formSchema = z.object({
  additionalInformation: z.string().max(4000),
  attachments: z.object({
    supportingDocumentation: z.array(z.instanceof(File)).nullish(),
  }),
});

type FormSchema = z.infer<typeof formSchema>;

const attachmentList = [
  {
    name: "supportingDocumentation",
    label: "Supporting Documentation",
    required: false,
  },
] as const;

export const WithdrawRaiForm = () => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const [areYouSureModalIsOpen, setAreYouSureModalIsOpen] = useState(false);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);

  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const { data: item } = useGetItem(id!);

  const user = useGetUser();

  const handleSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      console.log(data);
      await submit({
        data: { ...data, id },
        endpoint: "/action/withdraw-rai",
        user: user.data,
        authority: Authority.MED_SPA,
      });

      setSuccessModalIsOpen(true);
    } catch (err: unknown) {
      if (err) {
        console.log("There was an error", err);
        setErrorModalIsOpen(true);
      }
    }
  };

  return (
    <SimplePageContainer>
      <I.Form {...form}>
        <form
          className="my-6 space-y-8 mx-auto"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <section>
            <h1 className="font-bold text-2xl mb-2">
              Withdraw Formal RAI Response Details
            </h1>
            <p className="my-1">
              <I.RequiredIndicator /> Indicates a required field
            </p>
            <p className="font-light mb-6 max-w-4xl">
              Complete this form to withdraw the Formal RAI response. Once
              complete, you and CMS will receive an email confirmation.
            </p>
          </section>
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
          <h3 className="font-bold text-2xl font-sans">Attachments</h3>
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
          <p>
            <I.RequiredIndicator />
            At least one attachment is required.
          </p>
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
          <I.FormField
            control={form.control}
            name="additionalInformation"
            render={({ field }) => {
              return (
                <I.FormItem>
                  <h3 className="font-bold text-2xl font-sans">
                    Explain your need for withdrawal. <I.RequiredIndicator />
                  </h3>
                  <I.FormLabel className="font-normal">
                    Add anything else that you would like to share with CMS.
                  </I.FormLabel>
                  <I.Textarea
                    {...field}
                    value={field.value || ""}
                    className="h-[200px] resize-none"
                  />
                  <I.FormDescription>
                    {field.value && field.value.length >= 0
                      ? `${4000 - field.value.length} characters remaining`
                      : "4000 characters allowed"}
                  </I.FormDescription>
                </I.FormItem>
              );
            }}
          />
          {form.formState.isSubmitting && (
            <div className="p-4">
              <LoadingSpinner />
            </div>
          )}
          <div className="flex gap-2">
            <I.Button
              disabled={form.formState.isSubmitting}
              type="button"
              onClick={() => setAreYouSureModalIsOpen(true)}
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
          </div>
        </form>
      </I.Form>
      {/* Are you sure modal */}
      <ConfirmationModal
        open={areYouSureModalIsOpen}
        onAccept={() => {
          setAreYouSureModalIsOpen(false);
          form.handleSubmit(handleSubmit)();
        }}
        onCancel={() => {
          setAreYouSureModalIsOpen(false);
        }}
        title="Withdraw Formal RAI Response?"
        body={`You are about to withdraw the Formal RAI Response for ${id}. CMS will be notified.`}
        acceptButtonText="Yes, withdraw response"
        cancelButtonText="Cancel"
      />

      <ConfirmationModal
        open={successModalIsOpen}
        onAccept={() => {
          setSuccessModalIsOpen(false);
          navigate(`/details?id=${id}`);
        }}
        onCancel={() => setSuccessModalIsOpen(false)}
        title="Withdraw Formal RAI Response request has been submitted."
        body={
          <p>
            Your Formal RAI Response has been withdrawn successfully. If CMS
            needs any additional information, they will follow up by email.
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
          <p>If you leave this page you will lose your progress on this form</p>
        }
      />
    </SimplePageContainer>
  );
};

export const WithdrawRai = () => (
  <PackageActionForm>
    <WithdrawRaiForm />
  </PackageActionForm>
);
