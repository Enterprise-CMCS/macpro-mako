import { Navigate } from "@/components/Routing";
import { Button } from "@/components/Inputs";
import { PlanType, ItemResult } from "shared-types";
import { ActionFormIntro, PackageInfo } from "./common";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as I from "@/components/Inputs";
import { LoadingSpinner } from "@/components";
import { AttachmentRecipe } from "@/lib";
import { AttachmentsSizeTypesDesc } from "@/pages/form/content";
import { useModalContext } from "@/pages/form/modals";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import {
  SlotAdditionalInfo,
  SlotAttachments,
} from "@/pages/actions/renderSlots";

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
  const { setCancelModalOpen } = useModalContext();
  const form = useForm<WithdrawPackageFormSchema>({
    resolver: zodResolver(withdrawPackageFormSchema),
  });
  const handleSubmit = useActionSubmitHandler({
    formHookReturn: form,
    authority: item?._source.authority as PlanType,
  });

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
        <h3 className="font-bold text-2xl font-sans">Attachments</h3>
        <p className="font-normal mb-4">
          Upload your supporting documentation for withdrawal or explain your
          need for withdrawal in the <em>Additional Information section.</em>
        </p>
        <I.Form {...form}>
          <form onSubmit={handleSubmit}>
            {/* Change faqLink once we know the anchor */}
            <AttachmentsSizeTypesDesc faqLink={"/faq"} />
            {attachments.map(({ name, label, required }) => (
              <I.FormField
                key={name}
                control={form.control}
                name={`attachments.${name}`}
                render={SlotAttachments({
                  label: (
                    <>
                      {label}
                      {required ? <I.RequiredIndicator /> : ""}
                    </>
                  ),
                  message: <I.FormMessage />,
                })}
              />
            ))}
            <I.FormField
              control={form.control}
              name="additionalInformation"
              render={SlotAdditionalInfo({
                required: true,
                label:
                  "Add anything else you would like to share with the state.",
                description: "4,000 characters allowed",
              })}
            />
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
