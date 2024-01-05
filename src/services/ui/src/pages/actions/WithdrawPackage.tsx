import { Navigate, useParams } from "@/components/Routing";
import { Button } from "@/components/Inputs";
import { useState } from "react";
import { PlanType, ItemResult } from "shared-types";
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
import { useModalContext } from "@/pages/form/modals";

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

export const WithdrawPackage = ({ item }: { item?: ItemResult }) => {
  const { id, type } = useParams("/action/:id/:type");
  const {
    cancelModalOpen,
    setCancelModalOpen,
    setSuccessModalOpen,
    setErrorModalOpen,
  } = useModalContext();
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
      if (!cancelModalOpen) {
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
          setSuccessModalOpen(true);
        }
      }
    } catch (err) {
      console.log(err);
      setErrorModalOpen(true);
    }
  };

  if (!item) return <Navigate path={"/"} />; // Prevents optional chains below
  return (
    <>
      {form.formState.isSubmitting && <LoadingSpinner />}
      <div>
        <ActionFormIntro title="Withdraw Medicaid SPA Package">
          <p>
            Complete this form to withdraw a package. Once complete, you will
            not be able to resubmit this package. CMS will be notified and will
            use this content to review your request. If CMS needs any additional
            information, they will follow up by email.
          </p>
        </ActionFormIntro>
        <PackageInfo item={item} />
        <I.Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Change faqLink once we know the anchor */}
            <AttachmentsSizeTypesDesc faqLink={"/faq"} />
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
                        Once you submit this form, a confirmation email is sent
                        to you and to CMS. CMS will use this content to review
                        your package. If CMS needs any additional information,
                        they will follow up by email.
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
                onClick={() => setCancelModalOpen(true)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </I.Form>
      </div>
    </>
  );
};
