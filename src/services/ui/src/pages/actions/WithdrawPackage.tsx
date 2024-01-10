import { Navigate } from "@/components/Routing";
import { PlanType, ItemResult } from "shared-types";
import { ActionFormIntro } from "./common";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionSubmitHandler } from "@/hooks/useActionFormController";
import { ActionFormTemplate } from "@/pages/actions/template";

const formSchema = z.object({
  additionalInformation: z
    .string()
    .max(4000, "This field may only be up to 4000 characters.")
    .optional(),
  attachments: z.object({
    supportingDocumentation: z.array(z.instanceof(File)).optional(),
  }),
});

export const WithdrawPackage = ({ item }: { item?: ItemResult }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const handleSubmit = useActionSubmitHandler<z.infer<typeof formSchema>>({
    formHookReturn: form,
    authority: item?._source.authority as PlanType,
    addDataConditions: [
      (data) => {
        if (
          !data.attachments.supportingDocumentation &&
          !data.additionalInformation
        ) {
          return {
            message: "An Attachment or Additional Information is required.",
          };
        } else {
          return null;
        }
      },
    ],
  });

  if (!item) return <Navigate path={"/"} />; // Prevents optionals below
  return (
    <ActionFormTemplate<z.infer<typeof formSchema>>
      item={item}
      formController={form}
      submitHandler={handleSubmit}
      intro={
        <ActionFormIntro title={`Withdraw ${item._source.planType} Package`}>
          <p>
            Complete this form to withdraw a package. Once complete, you will
            not be able to resubmit this package. CMS will be notified and will
            use this content to review your request. If CMS needs any additional
            information, they will follow up by email.
          </p>
        </ActionFormIntro>
      }
      attachments={[
        {
          name: "supportingDocumentation",
          label: "Supporting Documentation",
          required: false,
        },
      ]}
      attachmentFaqLink={"/faq"}
      attachmentInstructions={
        <p className="font-normal mb-4">
          Upload your supporting documentation for withdrawal or explain your
          need for withdrawal in the <em>Additional Information section.</em>
        </p>
      }
    />
  );
};
