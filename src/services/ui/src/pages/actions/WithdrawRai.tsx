import { ConfirmationModal, LoadingSpinner } from "@/components";
import * as I from "@/components/Inputs";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useParams } from "@/components/Routing";
import { opensearch, PlanType } from "shared-types";
import { useGetUser } from "@/api/useGetUser";
import { submit } from "@/api/submissionService";
import { useState } from "react";
import { FAQ_TARGET } from "@/routes";
import { useModalContext } from "@/pages/form/modals";

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

export const WithdrawRai = ({ item }: { item: opensearch.main.ItemResult }) => {
  const { id } = useParams("/action/:id/:type");
  const { setCancelModalOpen, setSuccessModalOpen, setErrorModalOpen } =
    useModalContext();
  const [areYouSureModalIsOpen, setAreYouSureModalIsOpen] = useState(false);
  const authority = item?._source.authority as PlanType;
  const user = useGetUser();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  const handleSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      console.log(data);
      await submit({
        data: { ...data, id },
        endpoint: "/action/withdraw-rai",
        user: user.data,
        authority: authority,
      });
      setSuccessModalOpen(true);
    } catch (err: unknown) {
      if (err) {
        console.log("There was an error", err);
        setErrorModalOpen(true);
      }
    }
  };

  return (
    <>
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
                path="/faq"
                hash="medicaid-spa-rai-attachments"
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
                path="/faq"
                hash="acceptable-file-formats"
                target={FAQ_TARGET}
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline"
              >
                FAQ Page
              </Link>
            }
            .
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
                    Additional Information
                    <I.RequiredIndicator />
                  </h3>
                  <I.FormLabel className="font-normal">
                    Explain your need for withdrawal.
                  </I.FormLabel>
                  <I.Textarea
                    {...field}
                    value={field.value || ""}
                    className="h-[200px] resize-none"
                  />
                  <I.FormDescription>
                    4,000 characters allowed
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
              onClick={async () => {
                await form.trigger();

                if (form.formState.isValid) {
                  setAreYouSureModalIsOpen(true);
                }
              }}
              className="px-12"
            >
              Submit
            </I.Button>
            <I.Button
              type="button"
              variant="outline"
              onClick={() => setCancelModalOpen(true)}
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
    </>
  );
};
